using Microsoft.AspNetCore.Mvc;

namespace GBL_MVC.Controllers;

public class DisclaimerController : Controller
{
    private readonly ILogger<DisclaimerController> _logger;

    public DisclaimerController(ILogger<DisclaimerController> logger, IConfiguration configuration)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        ViewData["Title"] = "Disclaimer";
        return View();
    }
}
