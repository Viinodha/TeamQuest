const SUPABASE_URL = 'https://slhnxgasqilfdugirrrg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaG54Z2FzcWlsZmR1Z2lycnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNTU5MDksImV4cCI6MjEwNTczMTkwOX0.Fi-9ayYD264VeqMidy79uzX4lZfwsjbpjylr7eMMzfI';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


const AVATAR_OPTIONS = [
  { id: 'g1', img: 'avatars/girlpix.png', group: 'Girl' },
  { id: 'g2', img: 'avatars/girlpix2.png', group: 'Girl' },
  { id: 'g3', img: 'avatars/girlpix3.png', group: 'Girl' },
  { id: 'b1', img: 'avatars/manpix1.png', group: 'Boy' },
  { id: 'b2', img: 'avatars/manpixel2.png', group: 'Boy' },
  { id: 'b3', img: 'avatars/manpix3.png', group: 'Boy' }
];

const seedPlayers = [
  { id: 1, name: 'Priya S', college: 'RMD', yearSection: '3rd yr, IT-B', skills: ['React','UI Design','Figma'], nonTechSkills: ['Dance','Pitching'], lookingFor: ['Chill Backend dev'], projects: ['Campus event app','ML mini-project'], contact: 'priya.s@example.com', socials: 'instagram: @priya.designs', avatar: 'g2', isSeed: true },
  { id: 2, name: 'Sai Dharsh', college: 'RMK', yearSection: '2nd yr, CSE-A', skills: ['Node.js','MongoDB','APIs'], nonTechSkills: ['Public Speaking'], lookingFor: ['Can make the PPT:pls','Canva'], projects: ['Disaster management system','SIH24 Finalist'], contact: 'saidharsh.k@example.com', socials: 'linkedin: /in/saidharshk', avatar: 'b1', isSeed: true },
  { id: 3, name: 'Elle Rebecca', college: 'RMKCET', yearSection: '4th yr, AIDS', skills: ['Python','ML','Data Viz'], nonTechSkills: [], lookingFor: ['Research Rat','hackathon-pitcher'], projects: ['Alzheimer detection paper','Trends analysis'], contact: 'divya.r@example.com', socials: 'github: /ellareb1', avatar: 'g3', isSeed: true },
  { id: 4, name: 'Karthik Kendrick', college: 'RMD', yearSection: '1st yr, IT-A', skills: [], nonTechSkills: ['Football','Anchoring'], lookingFor: ['Fellow footballer'], projects: ['State level Footballer','Gold medalist-NSS'], contact: 'karthik.m@example.com', socials: 'insta:sportykendry', avatar: 'b2', isSeed: true }
];


let players = [];
let selectedAvatar = AVATAR_OPTIONS[0].id;

const grid = document.getElementById('grid');
const emptyState = document.getElementById('emptyState');
const filterCollege = document.getElementById('filterCollege');
const filterSkill = document.getElementById('filterSkill');
const filterCategory = document.getElementById('filterCategory');
const avatarPicker = document.getElementById('avatarPicker');
const overlay = document.getElementById('overlay');
const fCollege = document.getElementById('fCollege');
const fCollegeOtherWrap = document.getElementById('fCollegeOtherWrap');
const fCollegeOther = document.getElementById('fCollegeOther');

fCollege.addEventListener('change', () => {
  const isOther = fCollege.value === 'Other';
  fCollegeOtherWrap.style.display = isOther ? 'block' : 'none';
  fCollegeOther.required = isOther;
  if (!isOther) fCollegeOther.value = '';
});

const COLLEGE_LOGOS = {
  RMK: { src: 'logos/rmk.png', size: 22 },
  RMD: { src: 'logos/rmd.png', size: 16 },
  RMKCET: { src: 'logos/rmkcet.png', size: 16 }
};

function collegeLogoFor(college) {
  const logo = COLLEGE_LOGOS[college];
  if (!logo) return '';
  return '<img src="' + logo.src + '" class="college-logo" style="width:' + logo.size + 'px; height:' + logo.size + 'px;" alt="' + escapeHtml(college) + ' logo">';
}

function avatarIconFor(avatarId) {
  const found = AVATAR_OPTIONS.find(a => a.id === avatarId);
  const src = found ? found.img : 'assets/girlpix.png';
  return '<img src="' + src + '" class="avatar-img" alt="avatar">';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- Supabase <-> app object mapping ----

function rowToPlayer(row) {
  return {
    id: row.id,
    name: row.name,
    college: row.college,
    yearSection: row.year_section,
    skills: row.skills || [],
    nonTechSkills: row.non_tech_skills || [],
    lookingFor: row.looking_for || [],
    projects: row.projects || [],
    contact: row.contact,
    socials: row.socials || '',
    avatar: row.avatar,
    isSeed: row.is_seed || false
  };
}

function playerToRow(player) {
  return {
    name: player.name,
    college: player.college,
    year_section: player.yearSection,
    skills: player.skills,
    non_tech_skills: player.nonTechSkills,
    looking_for: player.lookingFor,
    projects: player.projects,
    contact: player.contact,
    socials: player.socials,
    avatar: player.avatar,
    is_seed: player.isSeed || false
  };
}

async function loadPlayers() {
  const { data, error } = await supabaseClient.from('players').select('*').order('id', { ascending: true });

  if (error) {
    console.error('Failed to load players:', error);
    alert('Could not load the roster. Check the Supabase setup (table name, RLS) and your internet connection.');
    return [];
  }

  if (data.length === 0) {
    const seedRows = SEED_PLAYERS.map(playerToRow);
    const { data: inserted, error: insertError } = await supabaseClient.from('players').insert(seedRows).select();
    if (insertError) {
      console.error('Failed to seed players:', insertError);
      return [];
    }
    return inserted.map(rowToPlayer);
  }

  return data.map(rowToPlayer);
}

function buildAvatarPicker() {
  avatarPicker.innerHTML = '';
  let currentGroup = '';
  AVATAR_OPTIONS.forEach(opt => {
    if (opt.group !== currentGroup) {
      currentGroup = opt.group;
      const label = document.createElement('div');
      label.className = 'avatar-group-label';
      label.textContent = currentGroup;
      avatarPicker.appendChild(label);
    }
    const btn = document.createElement('div');
    btn.className = 'avatar-option' + (opt.id === selectedAvatar ? ' selected' : '');
    btn.innerHTML = '<img src="' + opt.img + '" class="avatar-img" alt="' + opt.group + '">';
    btn.dataset.id = opt.id;
    btn.addEventListener('click', () => {
      selectedAvatar = opt.id;
      buildAvatarPicker();
    });
    avatarPicker.appendChild(btn);
  });
}

const MAIN_COLLEGES = ['RMK', 'RMD', 'RMKCET'];

function render() {
  const collegeVal = filterCollege.value;
  const skillVal = filterSkill.value.trim().toLowerCase();
  const categoryVal = filterCategory.value;

  const filtered = players.filter(p => {
    const matchCollege = collegeVal === 'all'
      ? true
      : collegeVal === 'Other'
        ? !MAIN_COLLEGES.includes(p.college)
        : p.college === collegeVal;
    const allSkills = p.skills.concat(p.nonTechSkills || []);
    const matchSkill = !skillVal || allSkills.some(s => s.toLowerCase().includes(skillVal));

    let matchCategory = true;
    if (categoryVal === 'technical') {
      matchCategory = p.skills.length > 0;
    } else if (categoryVal === 'nontechnical') {
      matchCategory = p.skills.length === 0 && (p.nonTechSkills || []).length > 0;
    }

    return matchCollege && matchSkill && matchCategory;
  });

  grid.innerHTML = '';
  emptyState.style.display = filtered.length ? 'none' : 'block';

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card pixel-cut';

    const skillTags = p.skills.map(s => '<span class="tag">' + escapeHtml(s) + '</span>').join('');
    const nonTechTags = (p.nonTechSkills && p.nonTechSkills.length)
      ? p.nonTechSkills.map(s => '<span class="tag-teal">' + escapeHtml(s) + '</span>').join('')
      : '';
    const lookingForTags = (p.lookingFor && p.lookingFor.length)
      ? p.lookingFor.map(s => '<span class="tag-green">' + escapeHtml(s) + '</span>').join('')
      : '';
    const projectItems = p.projects.length
      ? p.projects.map(pr => '<li>' + escapeHtml(pr) + '</li>').join('')
      : '<li>no projects listed yet</li>';

    const deleteBtn = p.isSeed ? '' : '<button class="delete-btn" data-id="' + p.id + '" title="Remove">✕</button>';

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.contact);
    const contactDisplay = isEmail
      ? '<a href="mailto:' + escapeHtml(p.contact) + '" class="contact-link">📧 ' + escapeHtml(p.contact) + '</a>'
      : 'contact: ' + escapeHtml(p.contact);

    card.innerHTML =
      deleteBtn +
      '<div class="card-top">' +
        '<div class="avatar">' + avatarIconFor(p.avatar) + '</div>' +
        '<div>' +
          '<p class="card-name">' + escapeHtml(p.name) + '</p>' +
          '<p class="card-meta">' + collegeLogoFor(p.college) + escapeHtml(p.college) + ' · ' + escapeHtml(p.yearSection) + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="tag-row">' + skillTags + '</div>' +
      (nonTechTags ? '<div class="tag-row">' + nonTechTags + '</div>' : '') +
      (lookingForTags ? '<p class="section-label">Looking for</p><div class="tag-row">' + lookingForTags + '</div>' : '') +
      '<p class="section-label">Past projects</p>' +
      '<ul class="project-list">' + projectItems + '</ul>' +
      '<div class="card-footer">' +
        '<button class="btn btn-amber reveal-btn" data-id="' + p.id + '">Team up</button>' +
      '</div>' +
      '<div class="reveal-box" id="reveal-' + p.id + '">' +
        contactDisplay + (p.socials ? '<br>' + escapeHtml(p.socials) : '') +
      '</div>';

    grid.appendChild(card);
  });

  document.querySelectorAll('.reveal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const box = document.getElementById('reveal-' + btn.dataset.id);
      box.classList.toggle('shown');
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idToRemove = Number(btn.dataset.id);
      btn.disabled = true;
      const { error } = await supabaseClient.from('players').delete().eq('id', idToRemove);
      if (error) {
        console.error('Failed to delete:', error);
        alert('Could not remove this profile. Try again.');
        btn.disabled = false;
        return;
      }
      players = players.filter(pl => pl.id !== idToRemove);
      render();
    });
  });
}

filterCollege.addEventListener('change', render);
filterSkill.addEventListener('input', render);
filterCategory.addEventListener('change', render);

document.getElementById('openAddBtn').addEventListener('click', () => {
  buildAvatarPicker();
  overlay.classList.add('shown');
});
document.getElementById('cancelAddBtn').addEventListener('click', () => overlay.classList.remove('shown'));
overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('shown'); });

document.getElementById('addForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const skillsValue = document.getElementById('fSkills').value.split(',').map(s => s.trim()).filter(Boolean);
  const nonTechValue = document.getElementById('fNonTechSkills').value.split(',').map(s => s.trim()).filter(Boolean);

  if (skillsValue.length === 0 && nonTechValue.length === 0) {
    alert('Add at least one skill — technical, non-technical, or both.');
    return;
  }

  const collegeValue = fCollege.value === 'Other'
    ? fCollegeOther.value.trim()
    : fCollege.value;

  const newPlayer = {
    avatar: selectedAvatar,
    name: document.getElementById('fName').value.trim(),
    college: collegeValue,
    yearSection: document.getElementById('fYearSection').value.trim(),
    skills: skillsValue,
    nonTechSkills: nonTechValue,
    lookingFor: document.getElementById('fLookingFor').value.split(',').map(s => s.trim()).filter(Boolean),
    projects: document.getElementById('fProjects').value.split(',').map(s => s.trim()).filter(Boolean),
    contact: document.getElementById('fContact').value.trim(),
    socials: document.getElementById('fSocials').value.trim(),
    isSeed: false
  };

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  const { data, error } = await supabaseClient.from('players').insert([playerToRow(newPlayer)]).select();

  submitBtn.disabled = false;
  submitBtn.textContent = 'Add to roster';

  if (error) {
    console.error('Failed to save player:', error);
    alert('Could not save your profile. Check your connection and try again.');
    return;
  }

  players.push(rowToPlayer(data[0]));
  render();

  e.target.reset();
  selectedAvatar = AVATAR_OPTIONS[0].id;
  fCollegeOtherWrap.style.display = 'none';
  fCollegeOther.required = false;
  overlay.classList.remove('shown');
});

async function init() {
  players = await loadPlayers();
  render();
}

init();