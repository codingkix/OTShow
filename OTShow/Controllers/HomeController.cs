﻿using Newtonsoft.Json;
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

        public ContentResult GetFeeds(string region)
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

            return new ContentResult { Content = result, ContentType = Helper.JSONTYPE };
        }
    }
}
