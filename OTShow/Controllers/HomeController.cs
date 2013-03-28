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
            DataFeed feed = null;
            string requestUrl = Helper.GetFeedsUrl(region);
            string result = string.Empty;
            try
            {
                HttpWebRequest httpWebRequest = (HttpWebRequest)WebRequest.Create(requestUrl);
                httpWebRequest.Method = WebRequestMethods.Http.Get;
                httpWebRequest.Accept = Helper.JSONTYPE;

                var response = httpWebRequest.GetResponse();
                using (var sr = new StreamReader(response.GetResponseStream()))
                {
                    result = sr.ReadToEnd();
                }

                feed = JsonConvert.DeserializeObject<DataFeed>(result);
            }
            catch (Exception ex)
            {

            }
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
            if (usFeed != null)
                allReservations.AddRange(usFeed.reservations);
            if (euFeed != null)
                allReservations.AddRange(euFeed.reservations);
            if (asiaFeed != null)
                allReservations.AddRange(asiaFeed.reservations);

            //Revenue calculation
            decimal usRevenue = usFeed != null ? Helper.CountRevenue(usFeed.reservations) : 0.00M;
            decimal euRevenue = euFeed != null ? Helper.CountRevenue(euFeed.reservations) : 0.00M;
            decimal asiaRevenue = asiaFeed != null ? Helper.CountRevenue(asiaFeed.reservations) : 0.00M;

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
                USReservationCount = usFeed != null ? usFeed.reservations.Count() : 0,
                EUReservationCount = euFeed != null ? euFeed.reservations.Count() : 0,
                AsiaReservationCount = asiaFeed != null ? asiaFeed.reservations.Count() : 0,
                USRevenue = usRevenue,
                EURevenue = euRevenue,
                AsiaRevenue = asiaRevenue,
                ConsumerSiteCount = consumerSite,
                MobileSiteCount = mobileSite,
                iOSCount = iOS,
                AndroidCount = android,
                YelpCount = yelp,
                OthersCount = others
            };

            string jsonResult = JsonConvert.SerializeObject(allResults);
            return new ContentResult { Content = jsonResult, ContentType = Helper.JSONTYPE };
        }
    }
}
