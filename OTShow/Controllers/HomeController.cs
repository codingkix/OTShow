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
            List<Reservation> allReservations = new List<Reservation>();
            allReservations.AddRange(usFeed.reservations);
            allReservations.AddRange(euFeed.reservations);
            allReservations.AddRange(asiaFeed.reservations);

            //Revenue calculation
            decimal usRevenue = Helper.CountRevenue(usFeed.reservations);
            decimal euRevenue = Helper.CountRevenue(euFeed.reservations);
            decimal asiaRevenue = Helper.CountRevenue(asiaFeed.reservations);

            //Piechart calculation

            int consumerSite = Helper.CountReservationSource(allReservations, "opentable.com");
            int iOS = Helper.CountReservationSource(allReservations, "ipad");
            iOS += Helper.CountReservationSource(allReservations, "iphone");
            int android = Helper.CountReservationSource(allReservations, "android");
            int mobileSite = Helper.CountReservationSource(allReservations, "mobile site");
            int yelp = Helper.CountReservationSource(allReservations, "yelp");
            int others = allReservations.Count - consumerSite - iOS - android - mobileSite - yelp;


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
