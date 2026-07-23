// Listing Location Modal Functionality
let selectedLocations = [];
let locationSearchTimeout;

$(document).ready(function() {
    // Load countries when modal opens
    $('#listingLocationModal').on('show.bs.modal', function() {
        loadCountries();
        resetLocationForm();
    });

    // Load countries
    function loadCountries() {
        $.get('/my/locations/countries')
            .done(function(response) {
                if (response.success) {
                    const countrySelect = $('#country_id');
                    countrySelect.empty().append('<option value="">Select Country</option>');
                    
                    response.countries.forEach(function(country) {
                        countrySelect.append(`<option value="${country.id}">${country.emoji} ${country.name}</option>`);
                    });
                }
            })
            .fail(function() {
                console.error('Failed to load countries');
            });
    }

    // Load states when country changes
    $('#country_id').on('change', function() {
        const countryId = $(this).val();
        const stateSelect = $('#state_id');
        const citySelect = $('#city_id');
        
        // Reset dependent selects
        stateSelect.empty().append('<option value="">Select State</option>');
        citySelect.empty().append('<option value="">Select City</option>');
        
        if (countryId) {
            $.get('/my/locations/states', { country_id: countryId })
                .done(function(response) {
                    if (response.success) {
                        response.states.forEach(function(state) {
                            stateSelect.append(`<option value="${state.id}">${state.name}</option>`);
                        });
                    }
                })
                .fail(function() {
                    console.error('Failed to load states');
                });
        }
    });

    // Load cities when state changes
    $('#state_id').on('change', function() {
        const stateId = $(this).val();
        const citySelect = $('#city_id');
        
        citySelect.empty().append('<option value="">Select City</option>');
        
        if (stateId) {
            $.get('/my/locations/cities', { state_id: stateId })
                .done(function(response) {
                    if (response.success) {
                        response.cities.forEach(function(city) {
                            citySelect.append(`<option value="${city.id}">${city.name}</option>`);
                        });
                    }
                })
                .fail(function() {
                    console.error('Failed to load cities');
                });
        }
    });

    // Load cities by country (for countries without states)
    $('#country_id').on('change', function() {
        const countryId = $(this).val();
        const stateId = $('#state_id').val();
        
        // If no state selected, load cities by country
        if (countryId && !stateId) {
            $.get('/my/locations/cities-by-country', { country_id: countryId })
                .done(function(response) {
                    if (response.success) {
                        const citySelect = $('#city_id');
                        citySelect.empty().append('<option value="">Select City</option>');
                        response.cities.forEach(function(city) {
                            citySelect.append(`<option value="${city.id}">${city.name}</option>`);
                        });
                    }
                })
                .fail(function() {
                    console.error('Failed to load cities by country');
                });
        }
    });

    // City selection change
    $('#city_id').on('change', function() {
        const cityId = $(this).val();
        if (cityId) {
            loadLocationDetails(cityId);
        } else {
            hideLocationPreview();
        }
    });

    // City search functionality
    $('#city_search').on('input', function() {
        const query = $(this).val().trim();
        
        clearTimeout(locationSearchTimeout);
        
        if (query.length >= 2) {
            locationSearchTimeout = setTimeout(function() {
                searchCities(query);
            }, 300);
        } else {
            hideCitySearchResults();
        }
    });

    // Search cities
    function searchCities(query) {
        $.get('/my/locations/search-cities', { query: query })
            .done(function(response) {
                if (response.success) {
                    displayCitySearchResults(response.cities);
                }
            })
            .fail(function() {
                console.error('Failed to search cities');
            });
    }

    // Display city search results
    function displayCitySearchResults(cities) {
        const resultsContainer = $('#city_search_results');
        resultsContainer.empty();
        
        if (cities.length > 0) {
            cities.forEach(function(city) {
                const cityItem = $(`
                    <div class="list-group-item list-group-item-action cursor-pointer" data-city-id="${city.id}">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">${city.name}</h6>
                        </div>
                        <p class="mb-1">${city.state ? city.state.name + ', ' : ''}${city.country.name}</p>
                    </div>
                `);
                
                cityItem.on('click', function() {
                    selectCityFromSearch(city.id);
                });
                
                resultsContainer.append(cityItem);
            });
            
            resultsContainer.show();
        } else {
            resultsContainer.html('<div class="text-muted p-2">No cities found</div>').show();
        }
    }

    // Select city from search results
    function selectCityFromSearch(cityId) {
        $('#city_id').val(cityId);
        $('#city_search').val('');
        hideCitySearchResults();
        loadLocationDetails(cityId);
    }

    // Hide city search results
    function hideCitySearchResults() {
        $('#city_search_results').hide().empty();
    }

    // Load location details
    function loadLocationDetails(cityId) {
        $.get('/my/locations/location-details', { city_id: cityId })
            .done(function(response) {
                if (response.success) {
                    displayLocationPreview(response.location);
                    $('#add-location-btn').prop('disabled', false);
                }
            })
            .fail(function() {
                console.error('Failed to load location details');
            });
    }

    // Display location preview
    function displayLocationPreview(location) {
        const preview = $('#selected-location-preview');
        const details = $('#location-details');
        
        details.html(`
            <strong>${location.city_name}</strong>
            ${location.state_name ? ', ' + location.state_name : ''}
            <br>
            <small class="text-muted">${location.country_name}</small>
            ${location.latitude && location.longitude ? 
                `<br><small class="text-muted">Coordinates: ${location.latitude}, ${location.longitude}</small>` : ''
            }
        `);
        
        preview.show();
    }

    // Hide location preview
    function hideLocationPreview() {
        $('#selected-location-preview').hide();
        $('#add-location-btn').prop('disabled', true);
    }

    // Add location to selected locations
    $('#add-location-btn').on('click', function() {
        const cityId = $('#city_id').val();
        if (cityId) {
            addLocationToList(cityId);
        }
    });

    // Add location to list
    function addLocationToList(cityId) {
        // Check if location already exists
        if (selectedLocations.some(loc => loc.city_id == cityId)) {
            alert('This location is already added');
            return;
        }

        // Get location details
        $.get('/my/locations/location-details', { city_id: cityId })
            .done(function(response) {
                if (response.success) {
                    selectedLocations.push(response.location);
                    displaySelectedLocations();
                    resetLocationForm();
                    $('#listingLocationModal').modal('hide');
                }
            })
            .fail(function() {
                console.error('Failed to add location');
            });
    }

    // Display selected locations
    function displaySelectedLocations() {
        const container = $('#selected-locations');
        container.empty();
        
        if (selectedLocations.length === 0) {
            container.html('<p class="text-muted">No locations selected</p>');
            return;
        }
        
        selectedLocations.forEach(function(location, index) {
            const locationItem = $(`
                <div class="card mb-2">
                    <div class="card-body py-2">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>${location.city_name}</strong>
                                ${location.state_name ? ', ' + location.state_name : ''}
                                <br>
                                <small class="text-muted">${location.country_name}</small>
                            </div>
                            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeLocation(${index})">
                                <i class="ri-delete-bin-line"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `);
            
            container.append(locationItem);
        });
    }

    // Remove location from list
    window.removeLocation = function(index) {
        selectedLocations.splice(index, 1);
        displaySelectedLocations();
    };

    // Reset location form
    function resetLocationForm() {
        $('#location-form')[0].reset();
        $('#state_id').empty().append('<option value="">Select State</option>');
        $('#city_id').empty().append('<option value="">Select City</option>');
        hideLocationPreview();
        hideCitySearchResults();
    }

    // Initialize selected locations display
    displaySelectedLocations();
});
