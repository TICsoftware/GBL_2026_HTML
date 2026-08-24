using System;
using System.ComponentModel.DataAnnotations;

namespace Core_project_BusinessLogic.Entity
{

public class EventMaster
{
    public const string TextBoxPattern = @"^[^~<>|/\\!@#]*$";
    public const string TextBoxPatternMessage =
        "Special characters ~ < > | / \\ ! @ # are not allowed.";

    public int EventId { get; set; }

    [Required(ErrorMessage = "Title is required.")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "Title must be between 2 and 200 characters.")]
    [RegularExpression(TextBoxPattern, ErrorMessage = TextBoxPatternMessage)]
    [Display(Name = "Title")]
    public string Title { get; set; }

    [Required(ErrorMessage = "Event type is required.")]
    [Display(Name = "Event Type")]
    public int? EventTypeId { get; set; }

    [Required(ErrorMessage = "Event mode is required.")]
    [Display(Name = "Event Mode")]
    public int? EventModeId { get; set; }

    [Required(ErrorMessage = "Event date is required.")]
    [Display(Name = "Event Date")]
    public DateTime? EventDate { get; set; }

    [StringLength(50, ErrorMessage = "Time cannot exceed 50 characters.")]
    [RegularExpression(TextBoxPattern, ErrorMessage = TextBoxPatternMessage)]
    public string? EventTime { get; set; }

    [Required(ErrorMessage = "Intro is required.")]
    [NoEditorSpecialChars]
    public string? Intro { get; set; }

    [NoEditorSpecialChars]
    public string? Content { get; set; }

    [StringLength(500, ErrorMessage = "Speakers cannot exceed 500 characters.")]
    [RegularExpression(TextBoxPattern, ErrorMessage = TextBoxPatternMessage)]
    public string? Speakers { get; set; }

    [Url(ErrorMessage = "Please enter a valid video URL.")]
    [StringLength(500, ErrorMessage = "Video URL cannot exceed 500 characters.")]
    public string? VideoUrl { get; set; }
    public string? FilePath { get; set; }

    public int? Status { get; set; }

    public string? EventTypeName { get; set; }
    public string? EventModeName { get; set; }

    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalRecords { get; set; }
    public string? SearchText { get; set; }

      public int? Created_UserID { get; set; }
        public DateTime? Created_Date { get; set; }

        public int? Updated_UserID { get; set; }
        public DateTime? Updated_Date { get; set; }
        public int? Published_UserID { get; set; }
        public DateTime? Published_Date { get; set; }
            public bool IsRecurring { get; set; }

public int? RecurringAfterDays { get; set; }

public DateTime? RecurringEndDate { get; set; }
}

public class EventMasterVM
{
    public List<EventMaster> List { get; set; }

    public EventMaster Current { get; set; }   // 🔥 REQUIRED

    public int TotalRecords { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public string? SearchText { get; set; }


    public bool IsRecurring { get; set; }

public int? RecurringAfterDays { get; set; }

public DateTime? RecurringEndDate { get; set; }
}



}