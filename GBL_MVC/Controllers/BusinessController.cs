using Microsoft.AspNetCore.Mvc;

namespace GBL_MVC.Controllers;

public class BusinessController : Controller
{
    private readonly ILogger<BusinessController> _logger;


    public BusinessController(ILogger<BusinessController> logger, IConfiguration configuration)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        return View();
    }


}
