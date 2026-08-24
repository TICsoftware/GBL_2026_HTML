using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
// using GBL_MVC.Models;

namespace GBL_MVC.Controllers;

public class ProductsController : Controller
{
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(ILogger<ProductsController> logger)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        return View();
    }

 

  
}
