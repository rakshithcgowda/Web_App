using BqcApi.Models;
using BqcApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BqcApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly IDataService _dataService;

        public AdminController(IDataService dataService)
        {
            _dataService = dataService;
        }

        [HttpGet("stats-overview")]
        public async Task<IActionResult> GetStatsOverview([FromQuery] string? startDate, [FromQuery] string? endDate, [FromQuery] string? groupName)
        {
            var filters = new BQCFilters { StartDate = startDate, EndDate = endDate, GroupName = groupName };
            var stats = await _dataService.GetBQCStatsAsync(filters);

            return Ok(new
            {
                success = true,
                data = stats
            });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _dataService.GetAllUsersAsync();
            var formattedUsers = users.Select(u => new
            {
                id = u.Id,
                username = u.Username,
                email = u.Email,
                fullName = u.FullName,
                isApproved = u.IsApproved,
                createdAt = u.CreatedAt
            });

            return Ok(new { success = true, data = formattedUsers });
        }
    }
}
