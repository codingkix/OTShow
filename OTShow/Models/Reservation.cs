using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OTShow.Models
{
    public class Reservation
    {
        public int resid { get; set; }
        public DateTime datemadeutc { get; set; }
        public DateTime shiftdatetime { get; set; }
        public int partysize { get; set; }
        public string billingtype { get; set; }
        public int rid { get; set; }
        public string restaurantname { get; set; }
        public double latitude { get; set; }
        public double longitude { get; set; }
        public int partnerid { get; set; }
        public string partnername { get; set; }
        public string ReservationDateString { get { return shiftdatetime.ToString(); } }
    }
}