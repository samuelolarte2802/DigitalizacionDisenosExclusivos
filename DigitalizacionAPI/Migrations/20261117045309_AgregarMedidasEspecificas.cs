using System;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigitalizacionAPI.Migrations
{
    /// <inheritdoc />
    public partial class AgregarMedidasEspecificas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<JsonElement>(
                name: "medidas_especificas",
                table: "pedidos",
                type: "jsonb",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "medidas_especificas",
                table: "pedidos");
        }
    }
}
