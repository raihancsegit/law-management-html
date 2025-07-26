This is a client management system for a bankruptcy law firm named Cohen & Cohen P.C.

# Lead Screen
Open file: ```leadDashboard1.html```

Once a new lead creates an account and verifies it, they will see this screen. This screen show 3 stages:
1. **Initial Application State**: When they did not start the application
2. **Application In Progress State**: When they start the application but leaves without submitting it
3. **Application Submitted State**: When they submit the application and waits for the law firm to accept the case.

When an application is started, it uses the file ```bankruptcyApplicationForm.html```.
It is a 4 step form which includes a signature pad. Leads can either sign online visually or just upload an image of their signature.
If anyone wants, they can download a pdf version to apply manually.


# Client Screen
Open file: ```clientDashboard.html```

Once the law firm accepts the application, the user now gets a new dashboard inside the same login. All the pre-defined folders like before are created only after an admin/attorney updates the user status from lead to client.

All the files that start with ```clientFinancialQuestionnaire...html``` are connected to this screen. 

**Note**: These html files are not production ready, as each file is reusing the same code, so it's not optimized for production.

The pdf ```Financial Questionnaire.pdf``` is implemented here. 
- The first few pages are implemented in the dashboard under *Step 1: Critical Information & Rules*.
- The required document details for regular and emergency cases implemented in the dashboard under *Step 2: Upload Required Documents*.
- The rest of the pdf file, a huge form, is implemented in the tab *Financial Questionnaire*, which can be accessed from the dashboard too.



# Attorney/Admin Screen
To be implemented.