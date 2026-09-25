using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AwsQuest.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddNetworkInfrastructureAndPlacementScope : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Kind",
                table: "aws_services",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "ManagedService");

            migrationBuilder.AddColumn<string>(
                name: "PlacementScope",
                table: "aws_services",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "RegionalGlobal");

            migrationBuilder.AddColumn<string>(
                name: "default_config_json",
                table: "aws_services",
                type: "jsonb",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Kind",
                table: "aws_services");

            migrationBuilder.DropColumn(
                name: "PlacementScope",
                table: "aws_services");

            migrationBuilder.DropColumn(
                name: "default_config_json",
                table: "aws_services");
        }
    }
}
