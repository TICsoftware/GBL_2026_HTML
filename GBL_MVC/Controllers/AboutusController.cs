using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
// using GBL_MVC.Models;

namespace GBL_MVC.Controllers;

public class AboutusController : Controller
{
    private readonly ILogger<AboutusController> _logger;

    public AboutusController(ILogger<AboutusController> logger)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        return View();
    }

 

  
}
