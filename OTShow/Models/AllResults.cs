using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OTShow.Models
{
    public class AllResults
    {
        public DataFeed USFeeds { get; set; }
        public DataFeed EUFeeds { get; set; }
        public DataFeed AsiaFeeds { get; set; }

        public int USReservationCount { get; set; }
        public int EUReservationCount { get; set; }
        public int AsiaReservationCount { get; set; }
        public int TotalReservation { get { return USReservationCount + EUReservationCount + AsiaReservationCount; } }

        public decimal USRevenue { get; set; }
        public decimal EURevenue { get; set; }
        public decimal AsiaRevenue { get; set; }
        public decimal TotalRevenue { get { return USRevenue + EURevenue + AsiaRevenue; } }

        public int ConsumerSiteCount { get; set; }
        public int iOSCount { get; set; }
        public int AndroidCount { get; set; }
        public int MobileSiteCount { get; set; }
        public int YelpCount { get; set; }
        public int OthersCount { get; set; }

        public List<TimeGroupCount> TimeGroupCounts { get; set; }
    }
}