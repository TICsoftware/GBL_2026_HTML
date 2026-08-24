using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
// using GBL_MVC.Models;

namespace GBL_MVC.Controllers;

public class ContactusController : Controller
{
    private readonly ILogger<ContactusController> _logger;

    public ContactusController(ILogger<ContactusController> logger)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        return View();
    }

 

  
}
