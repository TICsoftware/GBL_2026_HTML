using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using GBL_MVC.Models;
using GBL_MVC.Classes;
using GBL_BusinessLogic.BAL;
using GBL_BusinessLogic;
using GBL_MVC.Helpers;

namespace GBL_MVC.Controllers;

public class WorkwithusController : Controller
{
    private readonly ILogger<WorkwithusController> _logger;


    public WorkwithusController(ILogger<WorkwithusController> logger, IConfiguration configuration)
    {
        _logger = logger;
    
       
    }



    public IActionResult Index()
    {
        return View();
    }


}
