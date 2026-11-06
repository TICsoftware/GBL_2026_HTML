using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using GBL_MVC.Models;
using GBL_MVC.Classes;
using GBL_BusinessLogic.BAL;
using GBL_BusinessLogic;
using GBL_MVC.Helpers;

namespace GBL_MVC.Controllers;

public class MediaKitController : Controller
{
    private readonly ILogger<MediaKitController> _logger;


    public MediaKitController(ILogger<MediaKitController> logger, IConfiguration configuration)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        ViewData["Title"] = "Media Kit";
        return View();
    }


}
