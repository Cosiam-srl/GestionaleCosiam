#nullable enable
using CosiamAPI.Data;
using CosiamAPI.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace CosiamAPI.Common
{
    public class ReportUtils
    {
        /// <summary>
        /// </summary>
        /// <param name="context"></param>
        /// <param name="idCantiere"></param>
        /// <param name="dateFrom"></param>
        /// <param name="dateTo"></param>
        /// <returns>lista di report esistenti sul cantiere, aventi reference date compresa tra le date passate</returns>
        /// <exception cref="FormatException"></exception>
        public static List<ReportDiCantiere> GetReportsBetweenDates(ApplicationDbContext context, int idCantiere, string? dateFrom, string? dateTo)
        {
            IQueryable<ReportDiCantiere> q = context.ReportDiCantiere;
            q = q.Where(x => x.IdCantiere == idCantiere);

            // Ottieni i report dal database che soddisfano il filtro IdCantiere
            var reportList = q.ToList();

            if (!string.IsNullOrEmpty(dateFrom))
            {
                if (DateTime.TryParseExact(dateFrom, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime datefrom))
                {
                    reportList = reportList.Where(x => !string.IsNullOrEmpty(x.referenceDate) &&
                                                       DateTime.TryParseExact(x.referenceDate, "dd-MM-yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime refDate) &&
                                                       refDate >= datefrom).ToList();
                }
                else
                {
                    // Handle the case where dateFrom is not in the expected format
                    throw new FormatException($"dateFrom is not in the correct format: {dateFrom}");
                }
            }

            if (!string.IsNullOrEmpty(dateTo))
            {
                if (DateTime.TryParseExact(dateTo, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime dateto))
                {
                    reportList = reportList.Where(x => !string.IsNullOrEmpty(x.referenceDate) &&
                                                       DateTime.TryParseExact(x.referenceDate, "dd-MM-yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime refDate) &&
                                                       refDate <= dateto).ToList();
                }
                else
                {
                    // Handle the case where dateTo is not in the expected format
                    throw new FormatException($"dateTo is not in the correct format: {dateTo}");
                }
            }

            return reportList;
        }
    }
}