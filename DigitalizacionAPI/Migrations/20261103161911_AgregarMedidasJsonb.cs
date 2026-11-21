using System;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DigitalizacionAPI.Migrations
{
    /// <inheritdoc />
    public partial class AgregarMedidasJsonb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(

                name: "medidas",
                table: "clientes",
                type: "jsonb",
                nullable: false,
                defaultValue: "{}"

            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
            
                name: "medidas",
                table: "clientes"
            
            );
        }
    }
}
