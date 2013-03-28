using Newtonsoft.Json;
using OTShow.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;

namespace OTShow.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// Private helper funtion to send HTTP request and fetch Json feed by region
        /// </summary>
        /// <param name="region"></param>
        /// <returns></returns>
        private DataFeed GetFeedsByRegion(string region)
        {
            string requestUrl = Helper.GetFeedsUrl(region);
            string result = string.Empty;
            HttpWebRequest httpWebRequest = (HttpWebRequest)WebRequest.Create(requestUrl);
            httpWebRequest.Method = WebRequestMethods.Http.Get;
            httpWebRequest.Accept = Helper.JSONTYPE;

            var response = httpWebRequest.GetResponse();
            using (var sr = new StreamReader(response.GetResponseStream()))
            {
                result = sr.ReadToEnd();
            }

            DataFeed feed = JsonConvert.DeserializeObject<DataFeed>(result);
            return feed;
        }

        /// <summary>
        /// Action API returnning Json feed by region
        /// </summary>
        /// <param name="region"></param>
        /// <returns></returns>
        public ContentResult GetJsonFeed(string region)
        {
            DataFeed feed = GetFeedsByRegion(region);
            string jsonResult = JsonConvert.SerializeObject(feed);
            return new ContentResult { Content = jsonResult, ContentType = Helper.JSONTYPE };
        }

        /// <summary>
        /// Action API returning All Json data
        /// </summary>
        /// <returns></returns>
        public ContentResult GetAllResults()
        {
            DataFeed usFeed = GetFeedsByRegion("us");
            DataFeed euFeed = GetFeedsByRegion("eu");
            DataFeed asiaFeed = GetFeedsByRegion("asia");

            decimal usRevenue = usFeed.reservations.Count(r => r.billingtype == "standard") * Helper.StandardPay +
                usFeed.reservations.Count(r => r.billingtype != "standard") * Helper.OtherPay;

            decimal euRevenue = euFeed.reservations.Count(r => r.billingtype == "standard") * Helper.StandardPay +
    euFeed.reservations.Count(r => r.billingtype != "standard") * Helper.OtherPay;

            decimal asiaRevenue = asiaFeed.reservations.Count(r => r.billingtype == "standard") * Helper.StandardPay +
    asiaFeed.reservations.Count(r => r.billingtype != "standard") * Helper.OtherPay;

            AllResults allResults = new AllResults
            {
                USFeeds = usFeed,
                EUFeeds = euFeed,
                AsiaFeeds = asiaFeed,
                USReservationCount = usFeed.reservations.Count(),
                EUReservationCount = euFeed.reservations.Count(),
                AsiaReservationCount = asiaFeed.reservations.Count(),
                USRevenue = usRevenue,
                EURevenue = euRevenue,
                AsiaRevenue = asiaRevenue
            };

            string jsonResult = JsonConvert.SerializeObject(allResults);
            return new ContentResult { Content = jsonResult, ContentType = Helper.JSONTYPE };
        }
    }
}
