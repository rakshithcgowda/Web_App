using System.Security.Claims;
using BqcApi.Models;
using BqcApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BqcApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BqcController : ControllerBase
    {
        private readonly IDataService _dataService;
        private readonly IDocxService _docxService;

        public BqcController(IDataService dataService, IDocxService docxService)
        {
            _dataService = dataService;
            _docxService = docxService;
        }

        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] BQCData data)
        {
            if (string.IsNullOrEmpty(data.RefNumber))
                return BadRequest(new { success = false, message = "Reference number is required" });

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var id = await _dataService.SaveBQCDataAsync(userId, data);

            return Ok(new { success = true, data = new { id }, message = "BQC data saved successfully" });
        }

        [HttpGet("load/{id}")]
        public async Task<IActionResult> Load(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var data = await _dataService.GetBQCDataAsync(userId, id);

            if (data == null)
                return NotFound(new { success = false, message = "BQC data not found" });

            return Ok(new { success = true, data });
        }

        [HttpGet("list")]
        public async Task<IActionResult> List()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var list = await _dataService.ListBQCDataAsync(userId);

            return Ok(new { success = true, data = list });
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _dataService.DeleteBQCDataAsync(userId, id);

            return Ok(new { success = true, message = "BQC data deleted successfully" });
        }

        [HttpPost("generate")]
        [AllowAnonymous]
        public async Task<IActionResult> Generate([FromBody] GenerateRequest request)
        {
            if (request.data == null)
                return BadRequest(new { success = false, message = "Data is required" });

            var docContent = await _docxService.GenerateBqcDocxAsync(request.data);
            
            return File(docContent, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", $"BQC_{request.data.RefNumber}.docx");
        }
    }

    public class GenerateRequest
    {
        public BQCData? data { get; set; }
        public string format { get; set; } = "docx";
    }
}
