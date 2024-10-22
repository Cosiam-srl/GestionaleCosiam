using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosiamAPI.Data.Migrations
{
    public partial class AddedColumnScontoInPrezzarioAndApplyDiscountInServizioCliente : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ApplyDiscount",
                table: "ServizioCliente",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<double>(
                name: "DiscountPercentage",
                table: "PrezziarioCliente",
                type: "float",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApplyDiscount",
                table: "ServizioCliente");

            migrationBuilder.DropColumn(
                name: "DiscountPercentage",
                table: "PrezziarioCliente");
        }
    }
}
