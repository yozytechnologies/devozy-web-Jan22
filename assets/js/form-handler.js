async function go(event) {
    event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
  
    function isEmail(input) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(input);
    }
  
    function isValidName(input) {
      return input.length >= 3;
    }
  
    const valmail = isEmail(email);
    const valname = isValidName(name);
  
    if (!valmail) {
      alert("Please enter a valid email.");
      return;
    }
  
    if (!valname) {
      alert("Please enter a valid full name.");
      return;
    }
  
    const postdata = {
      ProductsInterested: [{ ProductId: 11006, ProductName: "ALL_IN_ONE" }],
      Firstname: name,
      Lastname: "",
      CompanyDetails: { CompanyName: "", website: "" },
      OfficialData: { Designation: "", OffEmail: email, Phone: "" },
      Country: "",
      StateOrCounty: "",
      Zipcode: "",
      Remarks: "Quick popup trial form",
      DateSubmitted: new Date().toISOString(),
      IsEmailVerified: null,
      IsCompanyVerified: null,
      IsApproved: null,
      ApprovalDate: null,
      ApprovalDetails: null,
      IsConvertedAsClient: null,
      ClientDetails: null,
      IsActive: "Y",
      Status: "Submitted"
    };
  
    try {
      const response = await fetch("https://api.yozytech.com/api/v1/form/subscription_web_enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postdata)
      });
  
      if (response.ok) {
        window.location.href = "https://devozy.ai/thankyou.html";
      } else if (response.status === 402) {
        alert("Email already exists.");
      } else {
        alert("Something went wrong.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }
  