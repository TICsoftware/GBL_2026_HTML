using Microsoft.AspNetCore.Mvc;

namespace GBL_MVC.Controllers;

public class BioBasedChemicalsController : Controller
{
    private readonly ILogger<BioBasedChemicalsController> _logger;


    public BioBasedChemicalsController(ILogger<BioBasedChemicalsController> logger, IConfiguration configuration)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        return View();
    }


}
