using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GBL_MVC.Routes
{
    public static class RouteConfig
    {
        public static void RegisterRoutes(this WebApplication app)
        {
            // ✅ Custom routes first


           
            app.MapControllerRoute(
                name: "Error",
                pattern: "Error",
                defaults: new { controller = "pagearticle", action = "Error" }
            );

            // ✅ Area / Admin route (before default)
            app.MapControllerRoute(
                name: "manage",
                pattern: "Manage/{action=Login}/{id?}",
                defaults: new { controller = "Manage" }
            );

            app.MapControllerRoute(
                name: "news-press-release",
                pattern: "news/press-release",
                defaults: new { controller = "News", action = "PressRelease" }
            );

            app.MapControllerRoute(
                name: "news-media-coverage",
                pattern: "news/media-coverage",
                defaults: new { controller = "News", action = "MediaCoverage" }
            );

            app.MapControllerRoute(
                name: "news-index",
                pattern: "news",
                defaults: new { controller = "News", action = "Index" }
            );
            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}"
            );
        }
    }
}