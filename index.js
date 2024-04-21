const projectIntro = `<div class="project-introduction">
                <h1>Introducing our Custom Browser Tabs implementation:</h1>
                <p>
                 Embark on a journey with our user-friendly solution, simplifying tab management. Our implementation offers:
                </p>
                <ul>
                    <li>Easy tab creation</li>
                    <li>Seamless URL input and content loading</li>
                    <li>Effortless tab switching</li>
                    <li>Built on the MVC design pattern for organized code</li>
                    <li>Enhanced with creative UI features like theme toggling and popup warnings</li>
                </ul>
                <p>
                   Explore our basic yet effective solution on <a href="#" target="_blank">GitHub</a>.
                </p>
            </div>`;

// Model
class Tab {
    constructor(url = '', id = 1) {
        this.url = url;
        this.id = id;
    }
}

// View
class TabView {
    constructor(controller) {
        this.controller = controller;
        this.tabsContainer = $('#tabs-container');
        this.contentContainer = $('#content-container-wrapper');
        this.tabContents = {};
    }

    createTabElement(tab) {
        const tabElement = $(`<div class="tab tab-${tab.id}"></div>`).text(tab.url || `New Tab ${tab.tabNo}`);
        const closeBtn = $('<button class="tab-close-btn">X</button>');

        tabElement.append(closeBtn);

        tabElement.on('click', () => this.controller.switchTab(tab.id));
        closeBtn.on('click', (event) => {
            event.stopPropagation();
            this.controller.closeTab(tab);
        });

        return tabElement;
    }

    addTab(tab) {
        const tabElement = this.createTabElement(tab);
        const tabDivider = $(`<div class="tab-divider tab-${tab.id}"></div>`);
        this.tabsContainer.append(tabElement, tabDivider);
    }

    switchTab(id) {
        const tab = this.controller.tabs.find(elem => elem.id === id);
        if (!tab) return;

        this.tabsContainer.find('.tab').removeClass('active');
        this.tabsContainer.find('.tab').eq(tab.index).addClass('active');


        const content = this.tabContents[ id ];
        if (content) {
            this.contentContainer.html(content);
        } else {
            this.loadTabContent(tab);
        }


        if (!tab.url) {
            $('.content-container').html(projectIntro);
        }
    }

    closeTab(tab) {
        this.controller.closeTab(tab);
    }

    loadTabContent(tab) {
        const content = `<div class="search-container-wrapper">
            <input class="search-field" type="text"></div>
            <div class="content-container"><iframe src="${tab.url}" width="100%" height="400"></iframe></div>`;
        this.tabContents[ tab.id ] = content;
        this.contentContainer.html(content);

        const inputField = this.contentContainer.find('.search-field');
        if (inputField.length === 1) {
            inputField.focus();
        }

        $('.content-container').html(projectIntro);
    }
}

// Controller
class TabController {
    constructor() {
        this.tabs = [];
        this.view = new TabView(this);
        this.activeTab = null;
    }

    addTab(url) {
        const id = Date.now();
        const newTab = new Tab(url, id);
        newTab.index = this.tabs.length;
        if (this.tabs.length) {
            newTab.tabNo = this.tabs[ this.tabs.length - 1 ].tabNo + 1;
        } else {
            newTab.tabNo = 1;
        }
        this.tabs.push(newTab);
        this.view.addTab(newTab);
        this.switchTab(id);
    }

    switchTab(tabId) {
        this.activeTab = tabId;
        this.view.switchTab(tabId);
    }

    closeTab(tab) {
        const tabIndex = this.tabs.findIndex(t => t.id === tab.id);
        if (tabIndex === -1) return;

        this.tabs.splice(tabIndex, 1);
        const tabsToRemove = this.view.tabsContainer.find(`.tab-${tab.id}`);
        tabsToRemove.remove();

        if (this.tabs.length === 0) {
            this.view.tabContents = {};
            this.view.contentContainer.html('');
            this.activeTab = null;
        }

        if (this.activeTab === tab.id) {
            this.activeTab = this.tabs[ tabIndex ] || this.tabs[ tabIndex - 1 ];
            this.switchTab(this.activeTab.id);
        }

    }
}

// Initialize
$(document).ready(() => {
    const controller = new TabController();
    controller.addTab('');

    $('#new-tab-btn').click(() => {
        controller.addTab('');
    });

    $(document).on('keydown', '.search-field', function (event) {
        if (event.key === "Enter" || event.keyCode === 13) {
            const value = $(this).val();
            const container = $(this).closest('#content-container-wrapper').find('.content-container');
            container.html(`<iframe src="${value}"></iframe>`);
            const activeTabId = controller.activeTab;
            controller.view.tabContents[ activeTabId ] = container.html();
            $(this).blur();
        }
    });

    $('.minimize-window').on('click', function () {
        $('#custom-browser-container').toggleClass('hidden');
        $('.broswer-dock').toggleClass('hidden');
    });
    $('.resize-window').on('click', function () {
        $('#custom-browser-container').toggleClass('custom-browser-container-small');
    });
    $('.close-window').on('click', function () {
        $('#warningPopup').toggleClass('hidden');
        const tabLength = controller.tabs.length;
        $('.popup-tab-copunt').text(tabLength);
    });
});


$('.broswer-dock').on('click', function () {
    $('#custom-browser-container').toggleClass('hidden');
    $('.broswer-dock').toggleClass('hidden');
});

$('.theme-toggle').on('click', function () {
    $('.light-theme-icon').toggleClass('hidden');
    $('.dark-theme-icon').toggleClass('hidden');
    $('.body').toggleClass('dark-theme');
});

function closePopup() {
    $('#warningPopup').addClass('hidden');
};

function reloadPage() {
    window.location.reload();
}
