using System;
using System.ComponentModel.DataAnnotations;

namespace Core_project_BusinessLogic.Entity
{
    public class MasterEntity
    {
        public const string TextBoxPattern = @"^[^~<>|/\\!@#]*$";
        public const string TextBoxPatternMessage =
            "Special characters ~ < > | / \\ ! @ # are not allowed.";

        public int ID { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 200 characters.")]
        [RegularExpression(TextBoxPattern, ErrorMessage = TextBoxPatternMessage)]
        public string Name { get; set; }

        [Required(ErrorMessage = "Sequence is required.")]
        [Range(1, 9999, ErrorMessage = "Sequence must be between 1 and 9999.")]
        public int? Sequence { get; set; }

         public int? Status { get; set; }
        public string? MasterType { get; set; }

        // 🔍 Search + Paging
        public string? SearchText { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public int TotalRecords { get; set; }
    }
   public class DeactivateModel
{
    public int Id { get; set; }
    public string? Type { get; set; }
}

    public class NABLStatusModel
    {
        public int Id { get; set; }
        public int Status { get; set; }
        public string? Type { get; set; }
    }
}