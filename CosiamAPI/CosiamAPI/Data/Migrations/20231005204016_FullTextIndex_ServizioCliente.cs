using CosiamAPI.Models;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosiamAPI.Data.Migrations
{
    public partial class FullTextIndex_ServizioCliente : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(sql: "CREATE FULLTEXT CATALOG ServizioClienteCatalog as default;", suppressTransaction: true);
            migrationBuilder.Sql(sql: "create fulltext index on ServizioCliente (Description language 1040 , rateCode language 1040) key index PK_ServizioCliente with stoplist=off", suppressTransaction: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(sql: "drop fulltext index on ServizioCliente", suppressTransaction: true);
            migrationBuilder.Sql("drop fulltext catalog ServizioClienteCatalog", suppressTransaction: true);
        }
    }
}
