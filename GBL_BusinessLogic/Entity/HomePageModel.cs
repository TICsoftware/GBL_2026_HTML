using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GBL_BusinessLogic.Entity
{
    public class HomePageModel
    {
        public ContentViewModel? Home_Content { get; set; }

        public List<ComponentGroup> Home_Components { get; set; } = new();

        public List<HomeCommonModel> Banners { get; set; } = new();
        public List<HomeCommonModel> ChooseYourJourney_List { get; set; } = new();
        public List<HomeCommonModel> CancerDiagnosis_List { get; set; } = new();
        public List<HomeCommonModel> FindTest_List { get; set; } = new();
        public List<HomeCommonModel> OurTeam_List { get; set; } = new();
        public List<HomeCommonModel> AnitaBorges_List { get; set; } = new();
        public List<HomeCommonModel> Academy_List { get; set; } = new();
        public List<HomeCommonModel> TrustQuality_List { get; set; } = new();
        public List<HomeCommonModel> Testimonials_List { get; set; } = new();
        public List<HomeCommonModel> OurValues_List { get; set; } = new();
    }



    public class HomeCommonModel
    {
        public string GroupId { get; set; }
        public string Title { get; set; }
        public string Intro { get; set; }
        public string HmpgIntro { get; set; }
        public string DisplayTitle { get; set; }
        public string Content { get; set; }
        public string ComponentThumbnail { get; set; }
        public string ComponentThumbnailAltText { get; set; }
        public string ThumbnailImage { get; set; }
        public string ThumbnailAltText { get; set; }
        public string Url { get; set; }
        public string Url_Text { get; set; }
        public int Sequence { get; set; }
        public int IsBlock { get; set; }
        public string Video_path { get; set; }
        public string Video_poster { get; set; }
        public string Icon_Image { get; set; }
          public string background_image { get; set; }
        public string Popup_Content { get; set; }
        public string Popup_Display_Title { get; set; }
        public string Section_title { get; set; }

    }




}