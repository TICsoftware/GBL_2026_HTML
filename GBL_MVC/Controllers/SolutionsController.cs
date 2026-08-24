using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
// using GBL_MVC.Models;

namespace GBL_MVC.Controllers;

public class SolutionsController : Controller
{
    private readonly ILogger<SolutionsController> _logger;

    public SolutionsController(ILogger<SolutionsController> logger)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        return View();
    }

 

  
}
