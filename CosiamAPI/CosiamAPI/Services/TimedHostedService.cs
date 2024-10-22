using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NetCoreBackend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

public class TimedHostedService : BackgroundService
{
    private int executionCount = 0;
    private readonly ILogger<TimedHostedService> _logger;
    private Timer _timer = null!;

    public IServiceProvider Services { get; }

    public TimedHostedService(ILogger<TimedHostedService> logger, IServiceProvider services)
    {
        _logger = logger;
        Services = services;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Scheduled service is starting...");
        await DoWork(stoppingToken);
    }

    private async Task DoWork(CancellationToken stoppingToken)
    {
        var count = Interlocked.Increment(ref executionCount);

        using (var scope = Services.CreateScope())
        {
            var scopedProcessingService =
                scope.ServiceProvider
                    .GetRequiredService<IScheduledService>();

            await scopedProcessingService.DoWork(stoppingToken);
        }
    }

    public override Task StopAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Scheduled service is stopping...");

        _timer?.Change(Timeout.Infinite, 0);

        return Task.CompletedTask;
    }

}