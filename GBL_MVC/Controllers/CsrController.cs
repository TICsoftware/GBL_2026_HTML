using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using GBL_MVC.Models;
using GBL_MVC.Classes;
using GBL_BusinessLogic.BAL;
using GBL_BusinessLogic;
using GBL_MVC.Helpers;

namespace GBL_MVC.Controllers;

public class CsrController : Controller
{
    private readonly ILogger<CsrController> _logger;


    public CsrController(ILogger<CsrController> logger, IConfiguration configuration)
    {
        _logger = logger;
    
       
    }



    public IActionResult Index()
    {
        return View();
    }


}
