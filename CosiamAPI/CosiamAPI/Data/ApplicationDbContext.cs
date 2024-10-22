using CosiamAPI.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using CosiamAPI.Models.Security;
using Microsoft.Extensions.Configuration;
using System.ComponentModel.DataAnnotations.Schema;

namespace CosiamAPI.Data
{
	public class ApplicationDbContext : IdentityDbContext
	{
		// ////// Sezione Mezzi
		public DbSet<Mezzi> Mezzi { get; set; }
		public DbSet<MezziNota> MezziNota { get; set; }


		public DbSet<Clienti> Clienti { get; set; }
		public DbSet<_File> File { get; set; }


		// ///// Sezione Personale
		public DbSet<Personale> Personale { get; set; }
		public DbSet<TimeCard> TimeCard { get; set; }

		//////// Sezione cantiere
		public DbSet<Cantiere> Cantiere { get; set; }
		public DbSet<ListaProjectManagerCantiere> ListaProjectManagerCantiere { get; set; }
		public DbSet<ListaCapiCantiere> ListaCapiCantiere { get; set; }
		public DbSet<ListaNoteDiCantiere> ListaNoteDiCantiere { get; set; }
		public DbSet<ListaPersonaleAssegnatoDiCantiere> ListaPersonaleAssegnatoDiCantiere { get; set; }
		public DbSet<ListaFileDiCantiere> ListaFileDiCantiere { get; set; }
		public DbSet<ListaMezziDiCantiere> ListaMezziDiCantiere { get; set; }
		public DbSet<ListaFornitoriCantiere> ListaFornitoriCantiere { get; set; }


		// ////// Sezione note
		public DbSet<Note> Note { get; set; }
		public DbSet<PersonaleResponsabileNota> PersonaleResponsabileDiNota { get; set; }
		public DbSet<AttachmentsNota> AttachmentsNota { get; set; }
		public DbSet<ThreadNota> ThreadNota { get; set; }

		// //////// fornitori
		public DbSet<Fornitori> Fornitori { get; set; }


		public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
			: base(options)
		{

		}
		public ApplicationDbContext()
		{

		}

		public DbSet<CosiamAPI.Models.PrezziarioCliente> PrezziarioCliente { get; set; }

		public DbSet<CosiamAPI.Models.AttrezzaturaAT> AttrezzaturaAT { get; set; }


		public DbSet<CosiamAPI.Models.DPI> DPI { get; set; }


		public DbSet<CosiamAPI.Models.StrumentiDiMisura> StrumentiDiMisura { get; set; }


		public DbSet<CosiamAPI.Models.InventarioGenerale> InventarioGenerale { get; set; }


		public DbSet<CosiamAPI.Models.Contratto> Contratto { get; set; }
		public DbSet<CosiamAPI.Models.ServizioCliente> ServizioCliente { get; set; }
		public DbSet<CosiamAPI.Models.ScontoCliente> ScontoCliente { get; set; }
		public DbSet<CosiamAPI.Models.AttachmentsSaltura> AttachmentsSaltura { get; set; }
		public DbSet<CosiamAPI.Models.Saltura> Saltura { get; set; }
		public DbSet<CosiamAPI.Models.ServizioFornitore> ServizioFornitore { get; set; }
		public DbSet<CosiamAPI.Models.ScadenzePersonale> ScadenzePersonale { get; set; }
		public DbSet<CosiamAPI.Models.ScadenzeFornitori> ScadenzeFornitori { get; set; }

		public DbSet<CosiamAPI.Models.ScadenzeMezzi> ScadenzeMezzi { get; set; }
		public DbSet<CosiamAPI.Models.ReportDiCantiere> ReportDiCantiere { get; set; }
		public DbSet<CosiamAPI.Models.VehicleCard> VehicleCard { get; set; }
		public DbSet<CosiamAPI.Models.ListOfServicesSoldToClient> ListOfServicesSoldToClient { get; set; }
		public DbSet<CosiamAPI.Models.ListOfGoodsAndServicesInUse> ListOfGoodsAndServicesInUse { get; set; }
		public DbSet<CosiamAPI.Models.DocumentsList> DocumentsList { get; set; }

		public DbSet<CosiamAPI.Models.attachementsAttrezzatura> attachementsAttrezzatura { get; set; }

		public DbSet<CosiamAPI.Models.FinancialCard> FinancialCard { get; set; }
		public DbSet<CosiamAPI.Models.BudgetModel> Budget { get; set; }
		public DbSet<CosiamAPI.Models.CapitoloBudgetModel> CapitoloBudget { get; set; }
		public DbSet<CosiamAPI.Models.AttivitaBudgetModel> AttivitaBudget { get; set; }
		public DbSet<CosiamAPI.Models.AttachmentsBudget> AttachmentsBudget { get; set; }

		public DbSet<CosiamAPI.Models.AllegatiEQuestionarioReportModel> AllegatiEQuestionarioReportModel { get; set; }

		public DbSet<CosiamAPI.Models.ListaPrezzariContratto> ListaPrezzariContratto { get; set; }

		public DbSet<CosiamAPI.Models.WordsCounter> WordsCounter { get; set; }

		public DbSet<CosiamAPI.Models.Security.ProfileManagement> ProfileManagement { get; set; }
		public DbSet<SystemParameters> Parameters { get; set; }
		public DbSet<ValoriAggiuntivi> ValoriAggiuntiviCantiereContratto { get; set; }


		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			modelBuilder.Entity<Personale>()
				.HasIndex(b => b.email)
				.IsClustered(false);

			//FK timecard-personale per impedire eliminazione di un personale se presente in un report
			modelBuilder.Entity<TimeCard>()
				.HasOne(x => x.Personale).WithMany()
				.HasForeignKey(x => x.PersonaleId)
				.OnDelete(DeleteBehavior.NoAction);
			//modelBuilder.Entity<ValoriAggiuntivi>()
			//    .HasOne<Cantiere>()
			//    .WithMany()
			//    .HasForeignKey(x => x.IdCantiere)
			//    .IsRequired(false)
			//    .OnDelete(DeleteBehavior.Cascade);
			//modelBuilder.Entity<ValoriAggiuntivi>()
			//    .HasOne<Contratto>()
			//    .WithMany()
			//    .HasForeignKey(x => x.IdContratto)
			//    .IsRequired(false)
			//    .OnDelete(DeleteBehavior.Cascade);

		}
		protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
		{
			if (!optionsBuilder.IsConfigured)
			{
				optionsBuilder.UseSqlServer(Startup.Configuration.GetConnectionString("DefaultConnection"));
			}
		}
	}
}
