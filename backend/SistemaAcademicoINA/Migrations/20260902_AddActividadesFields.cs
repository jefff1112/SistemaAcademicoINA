using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaAcademicoINA.Migrations
{
    /// <inheritdoc />
    public partial class AddActividadesFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Agregar columnas a la tabla actividades
            migrationBuilder.AddColumn<int>(
                name: "id_periodo",
                table: "actividades",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "orden",
                table: "actividades",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "es_predeterminada",
                table: "actividades",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            // Agregar foreign key para id_periodo
            migrationBuilder.CreateIndex(
                name: "IX_actividades_id_periodo",
                table: "actividades",
                column: "id_periodo");

            migrationBuilder.AddForeignKey(
                name: "FK_actividades_periodos_academicos_id_periodo",
                table: "actividades",
                column: "id_periodo",
                principalTable: "periodos_academicos",
                principalColumn: "id_periodo",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_actividades_periodos_academicos_id_periodo",
                table: "actividades");

            migrationBuilder.DropIndex(
                name: "IX_actividades_id_periodo",
                table: "actividades");

            migrationBuilder.DropColumn(
                name: "id_periodo",
                table: "actividades");

            migrationBuilder.DropColumn(
                name: "orden",
                table: "actividades");

            migrationBuilder.DropColumn(
                name: "es_predeterminada",
                table: "actividades");
        }
    }
}
