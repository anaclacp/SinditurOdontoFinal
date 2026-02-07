#!/usr/bin/env python3
"""
Comprehensive Backend API Test Suite for Dental Clinic Application
Tests all endpoints with realistic Brazilian data
"""

import requests
import json
from datetime import datetime
import uuid
import sys

# Base URL from frontend .env
BASE_URL = "https://dental-hub-41.preview.emergentagent.com/api"

# Test data with realistic Brazilian information
TEST_USER_DATA = {
    "name": "Maria Santos Silva",
    "email": f"maria.santos.{uuid.uuid4().hex[:8]}@email.com",
    "password": "minhasenha123",
    "phone": "(11) 99876-5432", 
    "cpf": "123.456.789-10",
    "birth_date": "15/08/1985",
    "address": "Rua das Palmeiras, 123 - Jardim Paulista, São Paulo - SP"
}

class DentalClinicAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.auth_token = None
        self.user_data = None
        self.appointment_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, message="", response=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "status": status,
            "success": success,
            "message": message,
            "response": response
        })
        print(f"{status}: {test_name}")
        if message:
            print(f"    Details: {message}")
        if not success and response:
            print(f"    Response: {response}")
        print()
    
    def test_health_check(self):
        """Test GET /api/ - Health Check"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Dental Clinic API" and data.get("status") == "running":
                    self.log_test("Health Check", True, "API is running correctly")
                else:
                    self.log_test("Health Check", False, f"Unexpected response: {data}")
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
    
    def test_get_units(self):
        """Test GET /api/units"""
        try:
            response = requests.get(f"{self.base_url}/units", timeout=10)
            
            if response.status_code == 200:
                units = response.json()
                if isinstance(units, list) and len(units) == 2:
                    unit_names = [unit["name"] for unit in units]
                    expected_names = ["Unidade Sinditur - Flores", "Unidade Centro"]
                    if all(name in unit_names for name in expected_names):
                        self.log_test("Get Units", True, f"Found {len(units)} units: {unit_names}")
                    else:
                        self.log_test("Get Units", False, f"Missing expected units. Found: {unit_names}")
                else:
                    self.log_test("Get Units", False, f"Expected 2 units, got {len(units) if isinstance(units, list) else 'non-list'}")
            else:
                self.log_test("Get Units", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Units", False, f"Exception: {str(e)}")
    
    def test_get_services(self):
        """Test GET /api/services"""
        try:
            response = requests.get(f"{self.base_url}/services", timeout=10)
            
            if response.status_code == 200:
                services = response.json()
                if isinstance(services, list) and len(services) == 7:
                    service_names = [service["name"] for service in services]
                    self.log_test("Get Services", True, f"Found {len(services)} services: {service_names[:3]}...")
                else:
                    self.log_test("Get Services", False, f"Expected 7 services, got {len(services) if isinstance(services, list) else 'non-list'}")
            else:
                self.log_test("Get Services", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Services", False, f"Exception: {str(e)}")
    
    def test_get_doctors(self):
        """Test GET /api/doctors"""
        try:
            # Test all doctors
            response = requests.get(f"{self.base_url}/doctors", timeout=10)
            
            if response.status_code == 200:
                doctors = response.json()
                if isinstance(doctors, list) and len(doctors) == 4:
                    doctor_names = [doctor["name"] for doctor in doctors]
                    self.log_test("Get All Doctors", True, f"Found {len(doctors)} doctors: {doctor_names}")
                else:
                    self.log_test("Get All Doctors", False, f"Expected 4 doctors, got {len(doctors) if isinstance(doctors, list) else 'non-list'}")
            else:
                self.log_test("Get All Doctors", False, f"HTTP {response.status_code}: {response.text}")
                return
                
        except Exception as e:
            self.log_test("Get All Doctors", False, f"Exception: {str(e)}")
            return
        
        # Test doctors filtered by unit
        try:
            response = requests.get(f"{self.base_url}/doctors?unit_id=unit-1", timeout=10)
            
            if response.status_code == 200:
                unit_doctors = response.json()
                if isinstance(unit_doctors, list) and len(unit_doctors) == 2:
                    doctor_names = [doctor["name"] for doctor in unit_doctors]
                    self.log_test("Get Doctors by Unit", True, f"Found {len(unit_doctors)} doctors in unit-1: {doctor_names}")
                else:
                    self.log_test("Get Doctors by Unit", False, f"Expected 2 doctors for unit-1, got {len(unit_doctors) if isinstance(unit_doctors, list) else 'non-list'}")
            else:
                self.log_test("Get Doctors by Unit", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Doctors by Unit", False, f"Exception: {str(e)}")
    
    def test_user_registration(self):
        """Test POST /api/auth/register"""
        try:
            response = requests.post(
                f"{self.base_url}/auth/register",
                json=TEST_USER_DATA,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.auth_token = data["access_token"]
                    self.user_data = data["user"]
                    self.log_test("User Registration", True, f"User registered: {self.user_data['name']} ({self.user_data['email']})")
                else:
                    self.log_test("User Registration", False, f"Missing token or user data in response: {data}")
            else:
                self.log_test("User Registration", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("User Registration", False, f"Exception: {str(e)}")
    
    def test_user_login(self):
        """Test POST /api/auth/login"""
        try:
            login_data = {
                "email": TEST_USER_DATA["email"],
                "password": TEST_USER_DATA["password"]
            }
            
            response = requests.post(
                f"{self.base_url}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.auth_token = data["access_token"]  # Update token
                    self.log_test("User Login", True, f"Login successful for: {data['user']['name']}")
                else:
                    self.log_test("User Login", False, f"Missing token or user data in response: {data}")
            else:
                self.log_test("User Login", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("User Login", False, f"Exception: {str(e)}")
    
    def test_get_current_user(self):
        """Test GET /api/auth/me"""
        if not self.auth_token:
            self.log_test("Get Current User", False, "No auth token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(
                f"{self.base_url}/auth/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                user = response.json()
                if user.get("email") == TEST_USER_DATA["email"]:
                    self.log_test("Get Current User", True, f"Retrieved user info: {user['name']}")
                else:
                    self.log_test("Get Current User", False, f"User data mismatch: {user}")
            else:
                self.log_test("Get Current User", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Current User", False, f"Exception: {str(e)}")
    
    def test_create_appointment(self):
        """Test POST /api/appointments"""
        if not self.auth_token:
            self.log_test("Create Appointment", False, "No auth token available")
            return
            
        try:
            appointment_data = {
                "unit_id": "unit-1",
                "service_id": "service-1", 
                "doctor_id": "doctor-1",
                "date": "15/02/2026",
                "time": "10:00",
                "notes": "Consulta de rotina para limpeza dental"
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                f"{self.base_url}/appointments",
                json=appointment_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                appointment = response.json()
                if appointment.get("status") == "agendado":
                    self.appointment_id = appointment["id"]
                    self.log_test("Create Appointment", True, f"Appointment created: {appointment['date']} at {appointment['time']}")
                else:
                    self.log_test("Create Appointment", False, f"Unexpected appointment status: {appointment}")
            else:
                self.log_test("Create Appointment", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Create Appointment", False, f"Exception: {str(e)}")
    
    def test_get_appointments(self):
        """Test GET /api/appointments"""
        if not self.auth_token:
            self.log_test("Get Appointments", False, "No auth token available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(
                f"{self.base_url}/appointments",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                appointments = response.json()
                if isinstance(appointments, list) and len(appointments) >= 1:
                    self.log_test("Get Appointments", True, f"Found {len(appointments)} appointments")
                    # Verify our created appointment is in the list
                    if self.appointment_id and any(apt["id"] == self.appointment_id for apt in appointments):
                        self.log_test("Verify Created Appointment", True, "Created appointment found in list")
                    else:
                        self.log_test("Verify Created Appointment", False, "Created appointment not found in list")
                else:
                    self.log_test("Get Appointments", False, f"Expected at least 1 appointment, got {len(appointments) if isinstance(appointments, list) else 'non-list'}")
            else:
                self.log_test("Get Appointments", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Appointments", False, f"Exception: {str(e)}")
    
    def test_cancel_appointment(self):
        """Test DELETE /api/appointments/{id}"""
        if not self.auth_token or not self.appointment_id:
            self.log_test("Cancel Appointment", False, "No auth token or appointment ID available")
            return
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.delete(
                f"{self.base_url}/appointments/{self.appointment_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if "message" in result:
                    self.log_test("Cancel Appointment", True, f"Appointment cancelled: {result['message']}")
                else:
                    self.log_test("Cancel Appointment", False, f"Unexpected response: {result}")
            else:
                self.log_test("Cancel Appointment", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Cancel Appointment", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("🦷 Starting Dental Clinic Backend API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Public endpoints
        self.test_health_check()
        self.test_get_units()
        self.test_get_services()
        self.test_get_doctors()
        
        # Auth endpoints
        self.test_user_registration()
        self.test_user_login()
        self.test_get_current_user()
        
        # Appointment endpoints (require auth)
        self.test_create_appointment()
        self.test_get_appointments()
        self.test_cancel_appointment()
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        for result in self.test_results:
            print(f"{result['status']}: {result['test']}")
            
        print()
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {total - passed}")
        print(f"📈 Success Rate: {(passed/total)*100:.1f}%")
        
        return self.test_results

def main():
    """Main function to run tests"""
    tester = DentalClinicAPITester()
    results = tester.run_all_tests()
    
    # Exit with error code if any test failed
    failed_tests = [r for r in results if not r["success"]]
    if failed_tests:
        print(f"\n⚠️  {len(failed_tests)} test(s) failed!")
        sys.exit(1)
    else:
        print("\n🎉 All tests passed!")
        sys.exit(0)

if __name__ == "__main__":
    main()