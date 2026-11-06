using Microsoft.AspNetCore.Mvc;

namespace GBL_MVC.Controllers;

public class PrivacyPolicyController : Controller
{
    private readonly ILogger<PrivacyPolicyController> _logger;

    public PrivacyPolicyController(ILogger<PrivacyPolicyController> logger, IConfiguration configuration)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        ViewData["Title"] = "Privacy Policy";
        return View();
    }
}
