using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;
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
                    return ConfigurationSettings.AppSettings["USFeedsUrl"].ToString();
                case "eu":
                    return ConfigurationSettings.AppSettings["EUFeedsUrl"].ToString();
                case "asia":
                    return ConfigurationSettings.AppSettings["AsiaFeedsUrl"].ToString();
                default:
                    return ConfigurationSettings.AppSettings["USFeedsUrl"].ToString();
            }
        }
    }
}