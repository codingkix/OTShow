using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;
using OTShow.Models;
namespace OTShow
{
    public class Helper
    {
        public const string JSONTYPE = "application/json";
        public const int StandardPay = 1;
        public const decimal OtherPay = 0.25M;

        public static string GetFeedsUrl(string region)
        {
            switch(region)
            {
                case "us":
                    return ConfigurationManager.AppSettings["USFeedsUrl"].ToString();
                case "eu":
                    return ConfigurationManager.AppSettings["EUFeedsUrl"].ToString();
                case "asia":
                    return ConfigurationManager.AppSettings["AsiaFeedsUrl"].ToString();
                default:
                    return ConfigurationManager.AppSettings["USFeedsUrl"].ToString();
            }
        }

        public static decimal CountRevenue(List<Reservation> reservations)
        {
           return reservations.Count(r => r.billingtype == "standard") * Helper.StandardPay +
                  reservations.Count(r => r.billingtype != "standard") * Helper.OtherPay;
        }

        public static int CountReservationSource(List<Reservation> reservations, string sourceName)
        {
            return reservations.Count(r => r.partnername.ToLower().Contains(sourceName));
        }

        public static int GetTimeDifference(DateTime startPoint, DateTime date)
        {
            return Convert.ToInt32(date.Subtract(startPoint).TotalDays);
        }
    }
}