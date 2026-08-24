using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GBL_BusinessLogic.Entity;

namespace GBL_BusinessLogic
{
    public static class Config_Application_Website
    {
        public static List<T> MapComponent<T>(
           List<ComponentGroup> data,
           int sequence,
           Func<ComponentGroup, Dictionary<string, ComponentField>, T> mapFunc)
        {
            return data
                .Where(g => g.Fields.Any() && g.Fields.First().sequence == sequence)
                .Select(group =>
                {
                    var dict = GetFieldDictionary(group);
                    return mapFunc(group, dict);
                })
                .ToList();
        }

        public static Dictionary<string, ComponentField> GetFieldDictionary(ComponentGroup group)
        {
            return group.Fields
                .GroupBy(x => x.FieldName)
                .ToDictionary(g => g.Key, g => g.First());
        }


        public static string GetPath(ComponentGroup group, string fieldName)
        {
            var path = group.Fields
                .FirstOrDefault(x =>
                    string.Equals(x.FieldName?.Trim(), fieldName.Trim(), StringComparison.OrdinalIgnoreCase)
                )?.ImagePath;

            return path ?? "";
        }




        public static string GetValue(Dictionary<string, ComponentField> dict, params string[] keys)
        {
            foreach (var key in keys)
            {
                var match = dict.FirstOrDefault(x =>
                    x.Key.Equals(key, StringComparison.OrdinalIgnoreCase));

                if (!string.IsNullOrEmpty(match.Value?.FieldValue))
                    return match.Value.FieldValue;
            }
            return "";
        }

        public static int GetIntValue(Dictionary<string, ComponentField> dict, params string[] keys)
        {
            foreach (var key in keys)
            {
                var match = dict.FirstOrDefault(x =>
                    x.Key.Equals(key, StringComparison.OrdinalIgnoreCase));

                if (int.TryParse(match.Value?.FieldValue, out int result))
                    return result;
            }

            return 0; // default if not found
        }

        public static string GetMetaUrl(string baseUrl, string path)
        {
            if (string.IsNullOrWhiteSpace(path))
                return "";

            if (path.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                return path;

            return $"{baseUrl?.TrimEnd('/')}/{path.TrimStart('/')}";
        }



    }
}