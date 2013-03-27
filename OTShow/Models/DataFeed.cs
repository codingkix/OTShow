using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OTShow.Models
{
    public class DataFeed
    {
        public string title { get; set; }
        public string href_self { get; set; }
        public string href_prev { get; set; }
        public int max_resid { get; set; }
        public DateTime max_datemadeutc { get; set; }
        public List<Reservation> reservations { get; set; }
           
    }
}