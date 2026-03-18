window.addEventListener('DOMContentLoaded', function() {
  var urlParams = new URLSearchParams(window.location.search);
  var articleSlug = urlParams.get('article');
  
  if (articleSlug) {
    showBlogArticle(articleSlug);
    window.history.replaceState({}, '', '/blog');
  }
  
  document.querySelectorAll('.blog-read-more').forEach(function(button) {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      var slug = button.getAttribute('data-slug');
      if (slug) {
        showBlogArticle(slug);
      }
    });
  });
});

function showBlogArticle(slug) {
  var blogList = document.getElementById('blog-list');
  var blogArticle = document.getElementById('blog-article');
  
  blogList.style.opacity = '0';
  blogList.style.transition = 'opacity 0.3s ease';
  
  setTimeout(function() {
    blogList.style.display = 'none';
    
    fetch('/api/blog/' + slug)
      .then(function(response) { return response.json(); })
      .then(function(data) {
        if (data.success) {
          var post = data.post;
          var date = new Date(post.published_at || post.created_at);
          var publishedDate = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
          
          var headerHTML = '';
          if (post.featured_image) {
            headerHTML = '<div style="min-height: 400px; background-image: url(' + post.featured_image + '); background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; position: relative; border-radius: 8px; overflow: hidden; margin-bottom: 2rem;">' +
              '<div style="background: rgba(0,0,0,0.65); position: absolute; top: 0; left: 0; right: 0; bottom: 0;"></div>' +
              '<div style="position: relative; z-index: 2; text-align: center; color: white; padding: 2rem;">' +
                '<h1 style="font-size: 3rem; margin-bottom: 1rem; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">' + post.title + '</h1>' +
                '<p style="font-size: 1.2rem; color: white; font-weight: 500; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">' +
                  '<i class="fas fa-calendar"></i> ' + publishedDate +
                '</p>' +
              '</div>' +
            '</div>';
          } else {
            headerHTML = '<div style="text-align: center; margin-bottom: 2rem;">' +
              '<h1 style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--color-primary);">' + post.title + '</h1>' +
              '<p style="font-size: 1.1rem; color: var(--color-text-secondary);">' +
                '<i class="fas fa-calendar"></i> ' + publishedDate +
              '</p>' +
            '</div>';
          }
          
          var content = post.content.replace(/\n/g, '<br />');
          
          blogArticle.innerHTML = '<div style="max-width: 800px; margin: 0 auto;">' +
            headerHTML +
            '<article style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 2rem;">' +
              '<div style="font-size: 1.1rem; line-height: 1.8; color: var(--color-text-primary);">' + content + '</div>' +
            '</article>' +
            '<div style="text-align: center;">' +
              '<button onclick="showBlogList()" class="btn btn-secondary">' +
                '<i class="fas fa-arrow-left"></i> Retour au blog' +
              '</button>' +
            '</div>' +
          '</div>';
          
          blogArticle.style.display = 'block';
          blogArticle.style.opacity = '0';
          blogArticle.style.transition = 'opacity 0.3s ease';
          setTimeout(function() {
            blogArticle.style.opacity = '1';
            document.querySelector('.section').scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }
      })
      .catch(function(error) {
        console.error('Erreur:', error);
        blogArticle.innerHTML = '<div style="text-align: center; padding: 2rem;"><p>Erreur de chargement.</p></div>';
        blogArticle.style.display = 'block';
      });
  }, 300);
}

function showBlogList() {
  var blogList = document.getElementById('blog-list');
  var blogArticle = document.getElementById('blog-article');
  
  window.history.pushState({}, '', '/blog');
  
  blogArticle.style.opacity = '0';
  
  setTimeout(function() {
    blogArticle.style.display = 'none';
    blogList.style.display = 'block';
    setTimeout(function() {
      blogList.style.opacity = '1';
      document.querySelector('.hero-blog').scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, 300);
}
