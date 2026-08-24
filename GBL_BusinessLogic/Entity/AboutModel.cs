using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GBL_BusinessLogic.Entity
{
    public class AboutModel
    {
        public ContentViewModel? Content { get; set; }
        public List<ComponentGroup> Components { get; set; } = new();
        public List<ComponentGroup> Components2 { get; set; } = new();

        public List<AboutCommonModel> BringingDiagnostic_List { get; set; } = new();
        public List<AboutCommonModel> COPWorks_List { get; set; } = new();
        public List<AboutCommonModel> TheVision_List { get; set; } = new();
        public List<AboutCommonModel> PartnersCollaborators_List { get; set; } = new();
        public List<AboutCommonModel> PartnerWithUs_List { get; set; } = new();

        public List<AboutCommonModel> RisingCancer_List { get; set; } = new();
        public List<AboutCommonModel> HaveQuery_List { get; set; } = new();


        public List<AboutCommonModel> OpenRoles_List { get; set; } = new();
        public List<AboutCommonModel> WorkingWithUs_List { get; set; } = new();
        public List<AboutCommonModel> CurrentOpportunities_List { get; set; } = new();
        public List<AboutCommonModel> ShareYourProfile_List { get; set; } = new();
        public int TotalCount { get; set; }

    }



    public class AboutCommonModel
    {
        public string GroupId { get; set; }
        public string Title { get; set; }
        public string Intro { get; set; }
        public string HmpgIntro { get; set; }
        public string DisplayTitle { get; set; }
        public string Content { get; set; }
        public string ComponentThumbnail { get; set; }
        public string ComponentThumbnailAltText { get; set; }

         public string Componentbackground { get; set; }
        public string ComponentbackgroundAltText { get; set; }
        public string ThumbnailImage { get; set; }
        public string ThumbnailAltText { get; set; }
        public string Url { get; set; }
        public string Url_Text { get; set; }
        public int Sequence { get; set; }
        public int IsBlock { get; set; }
        public string Video_path { get; set; }
        public string Video_poster { get; set; }
        public string Icon_Image { get; set; }
        public string Component_Icon_Image { get; set; }
        public string Popup_Content { get; set; }
        public string Popup_Display_Title { get; set; }
        public string Section_title { get; set; }

        public string Component_right_image { get; set; }
        public string Component_Right_image_alt { get; set; }

    }




}