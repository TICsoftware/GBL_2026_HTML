using System;


namespace Core_project_BusinessLogic.Entity
{
    public class TestMasterEntity
    {
        public int TestId { get; set; }
        public int? NABL_Option { get; set; }

        public string TestName { get; set; }

        public int? SpecimenId { get; set; }
        public int? TestTypeId { get; set; }
        public int? OrganId { get; set; }
        public int? DepartmentId { get; set; }

        public int? Status { get; set; }

        public int? Created_UserID { get; set; }
        public DateTime? Created_Date { get; set; }

        public int? Deactivated_UserID { get; set; }
        public DateTime? Deactivated_Date { get; set; }

        // Display helpers
       public string NABL_OptionName { get; set; }
        public string SpecimenName { get; set; }
        public string TestTypeName { get; set; }
        public string OrganName { get; set; }
        public string DepartmentName { get; set; }

        public int PageNumber { get; set; } = 1;

public int PageSize { get; set; } = 10;

public int TotalRecords { get; set; }

public string SearchText { get; set; }
    }

    public class StatusModel
{
    public int id { get; set; }
    public int status { get; set; }
}
}