using System.Collections.Concurrent;
using BqcApi.Models;

namespace BqcApi.Services
{
    public interface IDataService
    {
        // User methods
        Task<User?> GetUserByUsernameAsync(string username);
        Task<User?> GetUserByIdAsync(int id);
        Task<int> CreateUserAsync(User user);
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<IEnumerable<User>> GetPendingUsersAsync();
        Task ApproveUserAsync(int userId, int approvedBy);
        Task RejectUserAsync(int userId);

        // BQC methods
        Task<int> SaveBQCDataAsync(int userId, BQCData data);
        Task<BQCData?> GetBQCDataAsync(int userId, int id);
        Task<IEnumerable<object>> ListBQCDataAsync(int userId);
        Task DeleteBQCDataAsync(int userId, int id);
        Task<BQCStats> GetBQCStatsAsync(BQCFilters filters);
    }

    public class BQCStats
    {
        public int TotalBQCs { get; set; }
        public int TotalUsers { get; set; }
        public double TotalValue { get; set; }
        public double AvgValue { get; set; }
        public int GoodsCount { get; set; }
        public int ServiceCount { get; set; }
        public int WorksCount { get; set; }
        public int LeastCashOutflowCount { get; set; }
        public int LotWiseCount { get; set; }
    }

    public class BQCFilters
    {
        public string? StartDate { get; set; }
        public string? EndDate { get; set; }
        public string? GroupName { get; set; }
    }

    public class InMemoryDataService : IDataService
    {
        private readonly ConcurrentDictionary<int, User> _users = new();
        private readonly ConcurrentDictionary<int, BQCData> _bqcData = new();
        private int _nextUserId = 1;
        private int _nextBqcId = 1;

        public InMemoryDataService()
        {
            // Add a default admin user for testing
            var admin = new User
            {
                Id = _nextUserId++,
                Username = "anujk123@test.com",
                Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Email = "anujk123@test.com",
                FullName = "Admin User",
                IsApproved = true,
                CreatedAt = DateTime.UtcNow
            };
            _users.TryAdd(admin.Id, admin);
            Console.WriteLine($"[Service] Created default admin: {admin.Username}");
        }

        public Task<User?> GetUserByUsernameAsync(string username) =>
            Task.FromResult(_users.Values.FirstOrDefault(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase)));

        public Task<User?> GetUserByIdAsync(int id) =>
            Task.FromResult(_users.TryGetValue(id, out var user) ? user : null);

        public Task<int> CreateUserAsync(User user)
        {
            user.Id = _nextUserId++;
            _users.TryAdd(user.Id, user);
            return Task.FromResult(user.Id);
        }

        public Task<IEnumerable<User>> GetAllUsersAsync() =>
            Task.FromResult(_users.Values.AsEnumerable());

        public Task<IEnumerable<User>> GetPendingUsersAsync() =>
            Task.FromResult(_users.Values.Where(u => !u.IsApproved).AsEnumerable());

        public Task ApproveUserAsync(int userId, int approvedBy)
        {
            if (_users.TryGetValue(userId, out var user))
            {
                user.IsApproved = true;
                user.ApprovedAt = DateTime.UtcNow;
                user.ApprovedBy = approvedBy;
            }
            return Task.CompletedTask;
        }

        public Task RejectUserAsync(int userId)
        {
            _users.TryRemove(userId, out _);
            return Task.CompletedTask;
        }

        public Task<int> SaveBQCDataAsync(int userId, BQCData data)
        {
            // Check if record exists for same user and ref number
            var existing = _bqcData.Values.FirstOrDefault(b => b.UserId == userId && b.RefNumber == data.RefNumber);
            
            if (existing != null)
            {
                data.Id = existing.Id;
                data.UserId = userId;
                data.UpdatedAt = DateTime.UtcNow;
                _bqcData[existing.Id!.Value] = data;
                return Task.FromResult(existing.Id.Value);
            }
            else
            {
                data.Id = _nextBqcId++;
                data.UserId = userId;
                data.CreatedAt = DateTime.UtcNow;
                data.UpdatedAt = DateTime.UtcNow;
                _bqcData.TryAdd(data.Id.Value, data);
                return Task.FromResult(data.Id.Value);
            }
        }

        public Task<BQCData?> GetBQCDataAsync(int userId, int id) =>
            Task.FromResult(_bqcData.TryGetValue(id, out var data) && data.UserId == userId ? data : null);

        public Task<IEnumerable<object>> ListBQCDataAsync(int userId) =>
            Task.FromResult(_bqcData.Values
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new { 
                    id = b.Id, 
                    refNumber = b.RefNumber, 
                    tenderDescription = b.TenderDescription, 
                    createdAt = b.CreatedAt 
                })
                .Cast<object>());

        public Task DeleteBQCDataAsync(int userId, int id)
        {
            if (_bqcData.TryGetValue(id, out var data) && data.UserId == userId)
            {
                _bqcData.TryRemove(id, out _);
            }
            return Task.CompletedTask;
        }

        public Task<BQCStats> GetBQCStatsAsync(BQCFilters filters)
        {
            var query = _bqcData.Values.AsQueryable();

            if (!string.IsNullOrEmpty(filters.GroupName))
                query = query.Where(b => b.GroupName == filters.GroupName);

            // Date filtering simplified for dummy storage
            var results = query.ToList();

            var stats = new BQCStats
            {
                TotalBQCs = results.Count,
                TotalUsers = results.Select(b => b.UserId).Distinct().Count(),
                TotalValue = results.Sum(b => b.CecEstimateInclGst),
                AvgValue = results.Count > 0 ? results.Average(b => b.CecEstimateInclGst) : 0,
                GoodsCount = results.Count(b => b.TenderType == "Goods"),
                ServiceCount = results.Count(b => b.TenderType == "Service"),
                WorksCount = results.Count(b => b.TenderType == "Works"),
                LeastCashOutflowCount = results.Count(b => b.EvaluationMethodology == "least cash outflow"),
                LotWiseCount = results.Count(b => b.EvaluationMethodology == "Lot-wise")
            };

            return Task.FromResult(stats);
        }
    }
}
