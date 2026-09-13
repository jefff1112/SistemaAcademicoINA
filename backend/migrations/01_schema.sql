-- Esquema mínimo para el sistema académico
create table teachers (
  id serial primary key,
  name text not null
);

create table subjects (
  id serial primary key,
  name text not null
);

create table sections (
  id serial primary key,
  name text not null
);

create table assignments (
  id serial primary key,
  teacher_id int references teachers(id),
  subject_id int references subjects(id),
  section_id int references sections(id),
  unique (teacher_id, subject_id, section_id)
);

create table activities (
  id serial primary key,
  teacher_id int references teachers(id) not null,
  subject_id int references subjects(id) not null,
  section_id int references sections(id) not null,
  period int not null,
  name text not null,
  weight numeric not null check (weight >= 0 and weight <= 100)
);

create table students (
  id serial primary key,
  name text not null
);

create table enrollments (
  id serial primary key,
  student_id int references students(id),
  subject_id int references subjects(id),
  section_id int references sections(id),
  status text default 'ENROLLED',
  unique (student_id, subject_id)
);

create table grades (
  id serial primary key,
  student_id int references students(id),
  activity_id int references activities(id) on delete cascade,
  grade numeric check (grade >= 0 and grade <= 100)
);

-- Trigger para evitar que la suma de weights por (teacher,subject,section,period) exceda 100
create or replace function check_activity_weights() returns trigger as $$
declare total numeric;
begin
  select coalesce(sum(weight),0) into total from activities
	where teacher_id = coalesce(NEW.teacher_id, OLD.teacher_id)
	  and subject_id = coalesce(NEW.subject_id, OLD.subject_id)
	  and section_id = coalesce(NEW.section_id, OLD.section_id)
	  and period = coalesce(NEW.period, OLD.period)
	  and (id is null or id <> coalesce(OLD.id, -1));

  -- When inserting, include NEW.weight
  if (tg_op = 'INSERT') then
	total := total + NEW.weight;
  elsif (tg_op = 'UPDATE') then
	total := total + NEW.weight; -- OLD was excluded
  end if;

  if total > 100 then
	raise exception 'Peso total por periodo excede 100: %', total;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger trg_check_activity_weights
  before insert or update on activities
  for each row execute function check_activity_weights();
