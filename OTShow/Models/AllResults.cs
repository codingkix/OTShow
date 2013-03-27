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
    }
}