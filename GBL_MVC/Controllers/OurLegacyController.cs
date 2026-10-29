using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using GBL_MVC.Models;
using GBL_MVC.Classes;
using GBL_BusinessLogic.BAL;
using GBL_BusinessLogic;
using GBL_MVC.Helpers;

namespace GBL_MVC.Controllers;

public class OurLegacyController : Controller
{
    private readonly ILogger<OurLegacyController> _logger;


    public OurLegacyController(ILogger<OurLegacyController> logger, IConfiguration configuration)
    {
        _logger = logger;   
    }

    public IActionResult Index()
    {
        return View();
    }


}
