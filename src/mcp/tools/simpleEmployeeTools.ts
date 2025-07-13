// Simple MCP Tools for Employee Management (No Zod)
import { GameStateManager } from "../../state/stateManager.js";
import { getRandomEmployeeName, getRandomTrait } from "../../data/gameData.js";
import { Employee, EmployeeRole } from "../../types/gamedev.js";

export function registerEmployeeTools(server: any) {
  // Tool 1: Get All Employees
  server.tool(
    "getAllEmployees",
    "👥 Get list of all employees with their stats and roles",
    {},
    async () => {
      const employees = await GameStateManager.loadEmployees();
      
      if (employees.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "👥 No employees found! Your studio needs to hire some talent.",
            },
          ],
        };
      }

      let employeeList = `👥 Studio Team (${employees.length} employees):\n\n`;
      
      employees.forEach((emp, index) => {
        const primarySkill = Object.entries(emp.skills).reduce((a, b) => 
          emp.skills[a[0] as keyof typeof emp.skills] > emp.skills[b[0] as keyof typeof emp.skills] ? a : b
        );
        
        employeeList += `${index + 1}. ${emp.name} (${emp.role})\n`;
        employeeList += `   💰 Salary: $${emp.salary.toLocaleString()}/month\n`;
        employeeList += `   😊 Happiness: ${emp.happiness}/100\n`;
        employeeList += `   ⚡ Productivity: ${emp.productivity}/100\n`;
        employeeList += `   🎯 Best Skill: ${primarySkill[0]} (${primarySkill[1]})\n`;
        employeeList += `   📅 Experience: ${emp.experience} years\n`;
        
        if (emp.traits.length > 0) {
          employeeList += `   🎭 Traits: ${emp.traits.map(t => t.name).join(', ')}\n`;
        }
        
        employeeList += `   🆔 ID: ${emp.id}\n\n`;
      });

      return {
        content: [
          {
            type: "text",
            text: employeeList,
          },
        ],
      };
    }
  );

  // Tool 2: Hire New Employee
  server.tool(
    "hireEmployee",
    "🤝 Hire a new employee. Parameters: role (string), salary (number), name (optional string)",
    {
      role: { type: "string", description: "Employee role: programmer, designer, artist, sound_engineer, tester, producer, marketer" },
      salary: { type: "number", description: "Monthly salary offer" },
      name: { type: "string", description: "Employee name (optional, will generate random if not provided)" },
    },
    async (params: any) => {
      const { role, salary, name } = params;
      const studio = await GameStateManager.loadStudio();
      
      if (!studio) {
        return {
          content: [
            {
              type: "text",
              text: "❌ No studio found!",
            },
          ],
        };
      }

      // Check if studio can afford the salary
      const monthlyCosts = salary;
      if (studio.money < monthlyCosts * 3) { // Need at least 3 months runway
        return {
          content: [
            {
              type: "text",
              text: `❌ Cannot afford to hire! Need at least $${(monthlyCosts * 3).toLocaleString()} for 3 months runway.\nCurrent budget: $${studio.money.toLocaleString()}`,
            },
          ],
        };
      }

      // Generate employee
      const skills = {
        programming: Math.floor(Math.random() * 40) + 30,
        design: Math.floor(Math.random() * 40) + 30,
        art: Math.floor(Math.random() * 40) + 30,
        sound: Math.floor(Math.random() * 40) + 30,
        testing: Math.floor(Math.random() * 40) + 30,
        management: Math.floor(Math.random() * 40) + 20,
        marketing: Math.floor(Math.random() * 40) + 20
      };

      // Boost primary skill based on role
      switch (role) {
        case 'programmer': skills.programming += 25; break;
        case 'designer': skills.design += 25; break;
        case 'artist': skills.art += 25; break;
        case 'sound_engineer': skills.sound += 25; break;
        case 'tester': skills.testing += 25; break;
        case 'producer': skills.management += 25; break;
        case 'marketer': skills.marketing += 25; break;
      }

      const newEmployee: Employee = {
        id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name || getRandomEmployeeName(),
        role: role as EmployeeRole,
        skills: skills,
        salary: salary,
        happiness: Math.floor(Math.random() * 20) + 70, // 70-90
        productivity: Math.floor(Math.random() * 20) + 70, // 70-90
        experience: Math.floor(Math.random() * 8) + 1, // 1-8 years
        hiredDate: new Date().toISOString(),
        traits: Math.random() > 0.6 ? [getRandomTrait()] : [] // 40% chance of trait
      };

      // Deduct hiring costs (first month salary)
      studio.money -= salary;
      
      await GameStateManager.addEmployee(newEmployee);
      await GameStateManager.saveStudio(studio);

      // Log the hire
      await GameStateManager.addLog({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'hire',
        message: `🤝 Hired ${newEmployee.name} as ${role} for $${salary.toLocaleString()}/month`,
        details: { employeeId: newEmployee.id, role, salary, name: newEmployee.name }
      });

      const primarySkill = Object.entries(newEmployee.skills).reduce((a, b) => 
        newEmployee.skills[a[0] as keyof typeof newEmployee.skills] > newEmployee.skills[b[0] as keyof typeof newEmployee.skills] ? a : b
      );

      return {
        content: [
          {
            type: "text",
            text: `✅ Successfully hired ${newEmployee.name}!\n\n` +
                  `👤 Name: ${newEmployee.name}\n` +
                  `💼 Role: ${role}\n` +
                  `💰 Salary: $${salary.toLocaleString()}/month\n` +
                  `🎯 Best Skill: ${primarySkill[0]} (${primarySkill[1]})\n` +
                  `📅 Experience: ${newEmployee.experience} years\n` +
                  `😊 Happiness: ${newEmployee.happiness}/100\n` +
                  `⚡ Productivity: ${newEmployee.productivity}/100\n` +
                  (newEmployee.traits.length > 0 ? `🎭 Special Trait: ${newEmployee.traits[0].name}\n` : '') +
                  `\n💰 Remaining Budget: $${studio.money.toLocaleString()}`,
          },
        ],
      };
    }
  );

  // Tool 3: Fire Employee
  server.tool(
    "fireEmployee",
    "🚪 Fire an employee. Parameters: employeeId (string), reason (optional string)",
    {
      employeeId: { type: "string", description: "Employee ID to fire" },
      reason: { type: "string", description: "Reason for firing (optional)" },
    },
    async (params: any) => {
      const { employeeId, reason } = params;
      const employees = await GameStateManager.loadEmployees();
      const employee = employees.find(emp => emp.id === employeeId);
      
      if (!employee) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Employee with ID "${employeeId}" not found!`,
            },
          ],
        };
      }

      await GameStateManager.removeEmployee(employeeId);

      // Log the firing
      await GameStateManager.addLog({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'fire',
        message: `🚪 Fired ${employee.name} (${employee.role})${reason ? ` - ${reason}` : ''}`,
        details: { employeeId, name: employee.name, role: employee.role, reason }
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ ${employee.name} has been fired.\n\n` +
                  `👤 Name: ${employee.name}\n` +
                  `💼 Role: ${employee.role}\n` +
                  `💰 Was earning: $${employee.salary.toLocaleString()}/month\n` +
                  (reason ? `📝 Reason: ${reason}\n` : '') +
                  `\n💰 Monthly savings: $${employee.salary.toLocaleString()}`,
          },
        ],
      };
    }
  );

  // Tool 4: Get Employee Details
  server.tool(
    "getEmployeeDetails",
    "👤 Get detailed information about a specific employee. Parameters: employeeId (string)",
    {
      employeeId: { type: "string", description: "Employee ID" },
    },
    async (params: any) => {
      const { employeeId } = params;
      const employees = await GameStateManager.loadEmployees();
      const employee = employees.find(emp => emp.id === employeeId);
      
      if (!employee) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Employee with ID "${employeeId}" not found!`,
            },
          ],
        };
      }

      const hiredDate = new Date(employee.hiredDate);
      const daysSinceHired = Math.floor((Date.now() - hiredDate.getTime()) / (1000 * 60 * 60 * 24));

      let details = `👤 ${employee.name} - Detailed Profile\n\n`;
      details += `💼 Role: ${employee.role}\n`;
      details += `💰 Salary: $${employee.salary.toLocaleString()}/month\n`;
      details += `😊 Happiness: ${employee.happiness}/100\n`;
      details += `⚡ Productivity: ${employee.productivity}/100\n`;
      details += `📅 Experience: ${employee.experience} years\n`;
      details += `🗓️ Hired: ${hiredDate.toLocaleDateString()} (${daysSinceHired} days ago)\n\n`;

      details += `🎯 Skills:\n`;
      Object.entries(employee.skills).forEach(([skill, level]) => {
        const bars = '█'.repeat(Math.floor(level / 10)) + '░'.repeat(10 - Math.floor(level / 10));
        details += `  ${skill}: ${level}/100 [${bars}]\n`;
      });

      if (employee.traits.length > 0) {
        details += `\n🎭 Special Traits:\n`;
        employee.traits.forEach(trait => {
          details += `  • ${trait.name}: ${trait.description}\n`;
        });
      }

      details += `\n🆔 Employee ID: ${employee.id}`;

      return {
        content: [
          {
            type: "text",
            text: details,
          },
        ],
      };
    }
  );
}
