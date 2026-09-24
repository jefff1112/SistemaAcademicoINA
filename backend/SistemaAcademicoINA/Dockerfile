# Etapa 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar el archivo de proyecto y restaurar dependencias
COPY ["SistemaAcademicoINA.csproj", "."]
RUN dotnet restore "SistemaAcademicoINA.csproj"

# Copiar todo el código y publicar
COPY . .
RUN dotnet publish "SistemaAcademicoINA.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Etapa 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Instalar certificados CA para conexiones SSL a MySQL (Aiven)
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Copiar la publicación desde la etapa de build
COPY --from=build /app/publish .

# Puerto que Render asigna dinámicamente (por defecto 10000)
ENV PORT=10000
EXPOSE 10000

# Escuchar en 0.0.0.0 y el puerto de la variable de entorno PORT
ENTRYPOINT ["dotnet", "SistemaAcademicoINA.dll"]