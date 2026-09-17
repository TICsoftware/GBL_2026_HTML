using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using GBL_MVC.Models;
using GBL_MVC.Classes;
using GBL_BusinessLogic.BAL;
using GBL_BusinessLogic;
using GBL_MVC.Helpers;

namespace GBL_MVC.Controllers;

public class NewsController : Controller
{
    private readonly ILogger<NewsController> _logger;


    public NewsController(ILogger<NewsController> logger, IConfiguration configuration)
    {
        _logger = logger;   
    }

    public IActionResult Index()
    {
        return RedirectPermanent("/news/press-release");
    }

    public IActionResult PressRelease()
    {
        ViewData["Title"] = "Press Release";
        ViewData["NewsSection"] = "press-release";
        return View();
    }

    public IActionResult MediaCoverage()
    {
        ViewData["Title"] = "Media Coverage";
        ViewData["NewsSection"] = "media-coverage";
        return View();
    }


}
