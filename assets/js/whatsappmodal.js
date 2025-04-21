
window.addEventListener('load', () => {
    // Create modal HTML
    const modalHTML = `
    <div class="modal fade" id="whatsappConnectModal" tabindex="-1" aria-labelledby="whatsappConnectModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content text-center">
          <div class="modal-header">
            <h5 class="modal-title" id="whatsappConnectModalLabel">👋 Let’s Connect</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>
              We noticed you're exploring <b>Devozy.ai</b><br>
              Would you like to connect with our team on WhatsApp for a quick conversation or demo assistance?
            </p>
            <a href="https://wa.me/919894800455?text=Hello%2C%20I%27m%20exploring%20Devozy.ai%20and%20would%20like%20to%20schedule%20a%20quick%20discussion%20or%20product%20demo."
               target="_blank" 
               class="btn btn-success">
               💬 Chat with Us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>`;

    // Append modal to body
    const div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div);

    // Show modal after 2 minutes if not already shown
    setTimeout(() => {
      if (!sessionStorage.getItem('whatsappModalShown')) {
        const modal = new bootstrap.Modal(document.getElementById('whatsappConnectModal'));
        modal.show();
        sessionStorage.setItem('whatsappModalShown', 'true');
      }
    }, 120000); // 2 minutes (120000ms)

  });

