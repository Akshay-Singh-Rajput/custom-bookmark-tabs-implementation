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
                   Explore our basic yet effective solution on <a href="https://github.com/Akshay-Singh-Rajput/custom-bookmark-tabs-implementation" target="_blank">GitHub</a>.
                </p>
            </div>`;


const reloadSvgIcon = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="" height="1.4rem" width="1.4rem" version="1.1" id="Layer_1" viewBox="0 0 367.136 367.136" xml:space="preserve">
<path d="M367.136,149.7V36.335l-39.14,38.953c-13.024-17.561-29.148-32.731-47.732-44.706  c-29.33-18.898-63.352-28.888-98.391-28.888C81.588,1.694,0,83.282,0,183.568s81.588,181.874,181.874,181.874  c34.777,0,68.584-9.851,97.768-28.488c28.394-18.133,51.175-43.703,65.881-73.944l-26.979-13.119  c-25.66,52.77-78.029,85.551-136.669,85.551C98.13,335.442,30,267.312,30,183.568S98.13,31.694,181.874,31.694  c49.847,0,96.439,24.9,124.571,65.042L253.226,149.7H367.136z"/>
</svg>`;


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
            $('.search-field').val(tab.url);
        } else {
            this.loadTabContent(tab);
        }

        if (!tab.url) {
            $('.content-container').html(projectIntro);
        }

        $('.reload-icon').on('click', () => {
            this.reloadTab();
        });
    }

    closeTab(tab) {
        this.controller.closeTab(tab);
    }

    createContentContainerChunk(tab) {
        return `<div class="search-container-wrapper">
                    <div class="reload-icon">
                        ${reloadSvgIcon}
                    </div>
                    <input class="search-field" type="text" />
                </div>
                <div class="content-container"></div>`;
    }

    loadTabContent(tab) {
        const content = this.createContentContainerChunk(tab);
        this.tabContents[ tab.id ] = content;
        this.contentContainer.html(content);

        const inputField = this.contentContainer.find('.search-field');
        if (inputField.length === 1) {
            inputField.focus();
        }
    }

    reloadTab() {
        const tabId = this.controller.activeTabId;
        const srcValue = this.controller.activeTab.url;
        const iframeId = `iframe-${tabId}`;
        $(`#${iframeId}`).attr('src', srcValue);
    }

}

// Controller
class TabController {
    constructor() {
        this.tabs = [];
        this.view = new TabView(this);
        this.activeTabId = null;
        this.activeTab = {};
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
        this.activeTab = newTab;
        this.switchTab(id);
    }

    switchTab(tabId) {
        if (this.activeTabId === tabId) return;

        this.activeTabId = tabId;
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
            this.activeTab = {};
            this.activeTabId = null;
        }

        if (this.activeTabId === tab.id) {
            this.activeTab = this.tabs[ tabIndex ] || this.tabs[ tabIndex - 1 ];
            this.activeTabId = this.activeTab.id;
            this.switchTab(this.activeTab.id);
        }

    }
}

$(document).ready(() => {
    const controller = new TabController();
    controller.addTab('');

    $('#new-tab-btn').click(() => {
        controller.addTab('');
    });

    $(document).on('keydown', '.search-field', function (event) {
        if (event.key === "Enter" || event.keyCode === 13) {
            const value = $(this).val();
            const activeTabId = controller.activeTabId;
            const activeTab = controller.tabs.find(tab => tab.id === activeTabId);
            activeTab.url = value;
            const parentContainer = $('#content-container-wrapper');
            const container = parentContainer.find('.content-container');
            container.html(`<iframe src="${value}" id="iframe-${activeTabId}"></iframe>`);
            controller.view.tabContents[ activeTabId ] = parentContainer.html();
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