import os
import time
import random
import requests
import json
from datetime import datetime, timezone
import threading

class HeartbeatSimulator:
    def __init__(self):
        self.api_url = os.getenv('API_URL', 'http://localhost:8000')
        self.device_sn = os.getenv('DEVICE_SN', 'TEST12345678')
        self.device_name = os.getenv('DEVICE_NAME', 'Test Device')
        self.device_location = os.getenv('DEVICE_LOCATION', 'Test Location')
        self.interval = int(os.getenv('HEARTBEAT_INTERVAL', '60'))  # seconds
        self.boot_time = datetime.now(timezone.utc)
        
        # Simulation parameters
        self.base_cpu = float(os.getenv('BASE_CPU', '30'))
        self.base_ram = float(os.getenv('BASE_RAM', '40'))
        self.base_temp = float(os.getenv('BASE_TEMP', '45'))
        self.base_disk_free = float(os.getenv('BASE_DISK_FREE', '75'))
        
        # Add randomness and trends
        self.cpu_trend = 0
        self.temp_trend = 0
        self.connectivity_issues = False
        
    def generate_heartbeat(self):
        """Generate realistic heartbeat data with some randomness and trends"""
        
        # CPU usage with trend and spikes
        self.cpu_trend += random.uniform(-2, 2)
        self.cpu_trend = max(-20, min(20, self.cpu_trend))  # Keep trend reasonable
        
        cpu_usage = self.base_cpu + self.cpu_trend + random.uniform(-10, 15)
        cpu_usage = max(0, min(100, cpu_usage))  # Clamp to 0-100
        
        # Occasional CPU spikes
        if random.random() < 0.05:  # 5% chance of spike
            cpu_usage = min(100, cpu_usage + random.uniform(20, 40))
        
        # RAM usage (more stable than CPU)
        ram_usage = self.base_ram + random.uniform(-5, 10)
        ram_usage = max(0, min(100, ram_usage))
        
        # Temperature with trend
        self.temp_trend += random.uniform(-1, 1)
        self.temp_trend = max(-10, min(10, self.temp_trend))
        
        temperature = self.base_temp + self.temp_trend + random.uniform(-3, 3)
        temperature = max(20, min(90, temperature))  # Reasonable temp range
        
        # Disk free space (slowly decreasing over time)
        disk_free = self.base_disk_free - random.uniform(0, 0.1)
        self.base_disk_free = max(10, disk_free)  # Don't go below 10%
        disk_free = max(0, min(100, disk_free))
        
        # DNS latency
        base_latency = 8.8  # to Google DNS
        if random.random() < 0.1:  # 10% chance of network issues
            dns_latency = base_latency + random.uniform(50, 200)
            self.connectivity_issues = True
        else:
            dns_latency = base_latency + random.uniform(-2, 10)
            self.connectivity_issues = False
        
        dns_latency = max(1, dns_latency)
        
        # Connectivity (0 or 1)
        if self.connectivity_issues or random.random() < 0.02:  # 2% chance of disconnect
            connectivity = 0
        else:
            connectivity = 1
        
        return {
            "device_sn": self.device_sn,
            "cpu_usage": round(cpu_usage, 2),
            "ram_usage": round(ram_usage, 2),
            "disk_free": round(disk_free, 2),
            "temperature": round(temperature, 2),
            "dns_latency": round(dns_latency, 2),
            "connectivity": connectivity,
            "boot_time": self.boot_time.isoformat()
        }
    
    def send_heartbeat(self, heartbeat_data):
        """Send heartbeat to API"""
        try:
            response = requests.post(
                f"{self.api_url}/api/heartbeat/",
                json=heartbeat_data,
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"[{datetime.now()}] ✅ Heartbeat sent successfully - "
                      f"CPU: {heartbeat_data['cpu_usage']}%, "
                      f"RAM: {heartbeat_data['ram_usage']}%, "
                      f"Temp: {heartbeat_data['temperature']}°C, "
                      f"Connectivity: {heartbeat_data['connectivity']}")
            else:
                print(f"[{datetime.now()}] ❌ Failed to send heartbeat: {response.status_code}")
                print(f"Response: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"[{datetime.now()}] ❌ Network error: {e}")
        except Exception as e:
            print(f"[{datetime.now()}] ❌ Error sending heartbeat: {e}")
    
    def run(self):
        """Main simulation loop"""
        print(f"🚀 Starting heartbeat simulator for device {self.device_sn}")
        print(f"📡 API URL: {self.api_url}")
        print(f"⏱️  Interval: {self.interval} seconds")
        print(f"🔄 Boot time: {self.boot_time}")
        print("─" * 50)
        
        while True:
            try:
                heartbeat_data = self.generate_heartbeat()
                self.send_heartbeat(heartbeat_data)
                time.sleep(self.interval)
                
            except KeyboardInterrupt:
                print(f"\n[{datetime.now()}] 🛑 Simulator stopped by user")
                break
            except Exception as e:
                print(f"[{datetime.now()}] ❌ Unexpected error: {e}")
                time.sleep(5)  # Wait before retrying

def run_multiple_simulators():
    """Run multiple simulators in parallel"""
    device_configs = [
        {
            'DEVICE_SN': 'SRV001234567',
            'DEVICE_NAME': 'Server Room Sensor',
            'DEVICE_LOCATION': 'Data Center - Rack A1',
            'BASE_CPU': '25',
            'BASE_RAM': '45',
            'BASE_TEMP': '42',
            'HEARTBEAT_INTERVAL': '60'
        },
        {
            'DEVICE_SN': 'OFF987654321',
            'DEVICE_NAME': 'Office Environment Monitor',
            'DEVICE_LOCATION': 'Building B - Floor 3',
            'BASE_CPU': '15',
            'BASE_RAM': '30',
            'BASE_TEMP': '38',
            'HEARTBEAT_INTERVAL': '60'
        },
        {
            'DEVICE_SN': 'IOT555666777',
            'DEVICE_NAME': 'IoT Gateway Device',
            'DEVICE_LOCATION': 'Warehouse - Section C',
            'BASE_CPU': '40',
            'BASE_RAM': '60',
            'BASE_TEMP': '55',
            'HEARTBEAT_INTERVAL': '60'
        }
    ]
    
    threads = []
    
    for config in device_configs:
        # Set environment variables for this simulator
        for key, value in config.items():
            os.environ[key] = value
        
        # Create and start simulator
        simulator = HeartbeatSimulator()
        thread = threading.Thread(target=simulator.run)
        thread.daemon = True
        thread.start()
        threads.append(thread)
        
        print(f"Started simulator for {config['DEVICE_NAME']}")
        time.sleep(1)  # Stagger startup
    
    try:
        # Keep main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down all simulators...")

if __name__ == "__main__":
    # Check if we should run multiple simulators
    if os.getenv('MULTI_DEVICE', 'false').lower() == 'true':
        run_multiple_simulators()
    else:
        simulator = HeartbeatSimulator()
        simulator.run()